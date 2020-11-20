from pydub import AudioSegment
from pydub.silence import detect_silence
from pydub.silence import detect_nonsilent
from keras.models import load_model

import matplotlib.pyplot as plt
import numpy as np
import os
import sys
import librosa
import speech_recognition as sr
import json

import boto3
from botocore.exceptions import ClientError

# 추임새 판정, 분류 인공지능 모델
filler_classifier_model = load_model('./src/Transcription/filler_classifier_by_train2')
filler_determine_model = load_model('./src/Transcription/filler_determine_model_by_train2')


# 음성 구간에 padding을 붙이는 lambda함수
pad1d = lambda a, i: a[0: i] if a.shape[0] > i else np.hstack((a, np.zeros(i-a.shape[0])))
pad2d = lambda a, i: a[:, 0:i] if a.shape[1] > i else np.hstack((a, np.zeros((a.shape[0], i-a.shape[1]))))

# parameters
n_mfcc_size = 20
frame_length = 0.025
frame_stride = 0.0010

# adjust target amplitude
def match_target_amplitude(sound, target_dBFS):
    change_in_dBFS = target_dBFS - sound.dBFS
    return sound.apply_gain(change_in_dBFS)

# 추임새/비추임새 판정
def predict_filler(audio_file):
  # 추임새 판별을 위한 임시 음성 파일 생성
  audio_file.export("./src/Transcription/temp"+sys.argv[3]+".wav", format="wav")

  wav, sr = librosa.load("./src/Transcription/temp"+sys.argv[3]+".wav", sr=16000)
  #input_nfft = int(round(sr*frame_length))
  #input_stride = int(round(sr*frame_stride))
  try:
    mfcc = librosa.feature.mfcc(wav, sr=16000)
    padded_mfcc = pad2d(mfcc, 40)
    padded_mfcc = np.expand_dims(padded_mfcc, 0)

    result = filler_determine_model.predict(padded_mfcc)

    # 판별 완료된 음성 파일 삭제
    #os.remove("./src/Transcription/temp"+sys.argv[3]+"wav")

    if result[0][0] >= result[0][1]: # 추임새
      return 0 
    else:
      return 1
  except (ZeroDivisionError, ValueError):
    return 1

# 추임새 종류 판별
def predict_filler_type(audio_file):
  # 추임새 종류 판별을 위한 임시 음성 파일 생성
  audio_file.export("./src/Transcription/temp"+sys.argv[3]+".wav", format="wav")

  wav, sr = librosa.load("./src/Transcription/temp"+sys.argv[3]+".wav", sr =16000)
  #input_nfft = int(round(sr*frame_length))
  #input_stride = int(round(sr*frame_stride))

  mfcc = librosa.feature.mfcc(wav,sr=16000)
  padded_mfcc = pad2d(mfcc, 40)
  padded_mfcc = np.expand_dims(padded_mfcc, 0)

  result = filler_classifier_model.predict(padded_mfcc)

  # 판별 완료된 음성 파일 삭제
  # os.remove("./src/Transcription/temp.wav")

  return np.argmax(result)


def shorter_filler(json_result, audio_file, min_silence_len, start_time, non_silence_start):
  
  # 침묵 길이를 더 짧게
  min_silence_length = (int)(min_silence_len/1.2)

  intervals = detect_nonsilent(audio_file,
                              min_silence_len=min_silence_length,
                              silence_thresh=-32.64
                              )
  
  for interval in intervals:

    interval_audio = audio_file[interval[0]:interval[1]]

    # padding 40 길이 이상인 경우 더 짧게
    if (interval[1]-interval[0] >= 460):
      non_silence_start = shorter_filler(json_result, interval_audio, min_silence_length, interval[0]+start_time, non_silence_start)
    else:# padding 40 길이보다 짧은 경우 predict
      if interval[1]-interval[0] > 10 :
        if predict_filler(interval_audio) == 0 : # 추임새인 경우
          json_result.append({'start':non_silence_start,'end':start_time+interval[0],'tag':'1000'}) # tag: 1000 means non-slience
          non_silence_start = start_time + interval[0]
          
          # 추임새 tagging
          json_result.append({'start':start_time+interval[0],'end':start_time+interval[1],'tag':'1111'}) # tag: 1111 means filler word
        
    
  return non_silence_start


def create_json(audio_file):
  intervals_jsons = []

  min_silence_length = 70
  intervals = detect_nonsilent(audio_file,
                              min_silence_len=min_silence_length,
                              silence_thresh=-32.64
                              )
  
  if intervals[0][0] != 0:
    intervals_jsons.append({'start':0,'end':intervals[0][0],'tag':'0000'}) # tag: 0000 means silence
    
  non_silence_start = intervals[0][0]
  before_silence_start = intervals[0][1]

  for interval in intervals:
    interval_audio = audio_file[interval[0]:interval[1]]

     # 800ms초 이상의 공백 부분 처리
    if (interval[0]-before_silence_start) >= 800:
      intervals_jsons.append({'start':non_silence_start,'end':before_silence_start+200,'tag':'1000'}) # tag: 1000 means non-slience
      non_silence_start = interval[0]-200
      intervals_jsons.append({'start':before_silence_start,'end':interval[0],'tag':'0000'}) # tag: 0000 means slience

    if predict_filler(interval_audio) == 0 : # 추임새인 경우
      if len(interval_audio) <= 460  :
        intervals_jsons.append({'start':non_silence_start,'end':interval[0],'tag':'1000'}) # tag: 1000 means non-slience
        non_silence_start = interval[0]
        intervals_jsons.append({'start':interval[0],'end':interval[1],'tag':'1111'})
      else:
        non_silence_start = shorter_filler(intervals_jsons, interval_audio, min_silence_length, interval[0], non_silence_start)
    
    before_silence_start = interval[1]

  if non_silence_start != len(audio_file):
    intervals_jsons.append({'start':non_silence_start,'end':len(audio_file),'tag':'1000'})

  return intervals_jsons

def STT_with_json(audio_file, jsons):
  first_silence = 0
  num = 0
  unrecognizable_start = 0
  r = sr.Recognizer()
  transcript_json = []
  statistics_json = {}
  filler_1 = 0
  filler_2 = 0
  filler_3 = 0
  audio_total_length = audio_file.duration_seconds
  silence_interval = 0
  for json in jsons :
    if json['tag'] == '0000':
      # 통역 개시 지연시간
      if num == 0:
        first_silence = first_silence + (json['end']-json['start'])/1000
      else:
        silence_interval = silence_interval + (json['end']-json['start'])/1000
        silence = "(" + str(round((json['end']-json['start'])/1000)) + "초).."
        transcript_json.append({'start':json['start'],'end':json['end'],'tag':'0000','result':silence})

    elif json['tag'] == '1111':
      # 통역 개시 지연시간
      if num == 0:
        silence = "(" + str(round(first_silence)) + "초).."
        transcript_json.append({'start':0,'end':json['start'],'tag':'0000','result':silence})
        first_silence_interval = first_silence
      # 추임새(어, 음, 그) 구분  
      filler_type = predict_filler_type(audio_file[json['start']:json['end']])
      if filler_type == 0 :
        transcript_json.append({'start':json['start'],'end':json['end'],'tag':'1001','result':'어(추임새)'})
        filler_1 = filler_1 + 1
      elif filler_type == 1:
        transcript_json.append({'start':json['start'],'end':json['end'],'tag':'1010','result':'음(추임새)'})
        filler_2 = filler_2 + 1
      else:
        transcript_json.append({'start':json['start'],'end':json['end'],'tag':'1100','result':'그(추임새)'})
        filler_3 = filler_3 + 1
      num = num + 1
   
    elif json['tag'] == '1000':

      # 인식불가 처리
      if unrecognizable_start != 0:
        audio_file[unrecognizable_start:json['end']].export("./src/Transcription/temp"+sys.argv[3]+".wav", format="wav")
      else:
        audio_file[json['start']:json['end']].export("./src/Transcription/temp"+sys.argv[3]+".wav", format="wav")
      temp_audio_file = sr.AudioFile('./src/Transcription/temp'+sys.argv[3]+'.wav')
      with temp_audio_file as source:
        audio = r.record(source)
      try :
        stt = r.recognize_google(audio_data = audio, language = "ko-KR")
        # 통역 개시 지연시간
        if num == 0:
          silence = "(" + str(round(first_silence)) + "초).."
          transcript_json.append({'start':0,'end':json['start'],'tag':'0000','result':silence})
          first_silence_interval = first_silence
        if unrecognizable_start != 0:
          transcript_json.append({'start':unrecognizable_start,'end':json['end'],'tag':'1000','result':stt})
        else:
          transcript_json.append({'start':json['start'],'end':json['end'],'tag':'1000','result':stt})
        unrecognizable_start = 0
        num = num + 1
      except:
        if unrecognizable_start == 0:
          unrecognizable_start = json['start']
  os.remove("./src/Transcription/temp"+sys.argv[3]+".wav")
  
  statistics_json['어'] = filler_1
  statistics_json['음'] = filler_2
  statistics_json['그'] = filler_3
  statistics_json['통역개시지연시간'] = 100 * first_silence_interval/audio_total_length
  statistics_json['침묵시간'] = 100 * silence_interval/audio_total_length
  statistics_json['발화시간'] = 100 * (audio_total_length - first_silence - silence_interval)/audio_total_length
  return {"결과":transcript_json, "통계결과":statistics_json}


# 전사 함수
def make_transcript(audio_file_path):
  audio = AudioSegment.from_file(audio_file_path)
  normalized_audio = match_target_amplitude(audio, -20.0)
  intervals_jsons = create_json(normalized_audio) # 구간, 태그 정보를 담은 Json 형태의 Array 반환
  transcript_json = STT_with_json(normalized_audio, intervals_jsons) # JSON을 가지고 STT한 결과 추가

  return transcript_json

# 주어진 파일에 대해서 전사 실행후 S3에 저장
with open("./config/secret_config.json") as json_file: # app.js를 실행하는 위치에서의 상대경로
    audio_file_path = "./src/Transcription/audio_file"+sys.argv[3]+".mp3" # app.js를 실행하는 위치에서의 상대경로
    result_json = str(make_transcript(audio_file_path))
    
    #S3에 업로드
    S3_config_json = dict((json.load(json_file))["S3"])
    S3 = boto3.client(
        's3',
        aws_access_key_id=S3_config_json["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key = S3_config_json["AWS_SECRET_ACCESS"],
        region_name = S3_config_json["AWS_REGION"])
    bucket_name = "ewhaspeakupsource1"
    file_key = 'hw_assign/'+ sys.argv[1] + '/' + sys.argv[2] + '/JSON' + sys.argv[3] +'.json'
    
    
    S3.put_object(
      Bucket=bucket_name, # S3 bucket name
      Key=file_key, # file path + file name
      Body=result_json, # file data
      ACL = 'public-read') # public하게 read할 수 있다
    os.remove(audio_file_path)
    print("it is end" + file_key)