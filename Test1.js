import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';


export default function Test1() {
  //마이크 허가 요청
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  //카메라 허가 요청
  const [hasCameraPermission, setHasCameraPersmission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [record, setRecord] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  useEffect(() => {
    (async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPersmission(cameraStatus.status === 'granted');

        const audioStatus = await Camera.requestMicrophonePermissionsAsync();
        setHasAudioPermission(audioStatus.status === 'granted');
    })();
  }, []);

  //base64
  const TakeVideo = async () => {
    // 카메라가 존재하는 경우 실행
    if (Camera) {
      // try-catch 문으로 오류 처리 시작
      try {
        const data = await camera.recordAsync({
          maxDuration: 5,
        });
        // 영상 촬영을 시작하고 최대 5초 동안 녹화

        // 촬영된 영상의 URI를 상태 변수에 설정
        setRecord(data.uri);
        console.log("takeVideo: " + data.uri);
        // 촬영된 영상의 URI를 콘솔에 출력

        
        // const base64 = await FileSystem.readAsStringAsync(data.uri, {
        //   encoding: FileSystem.EncodingType.Base64,
        // });

        // 촬영된 영상을 FormData에 첨부하기 위해 FormData 객체 생성
        const formData = new FormData();
        formData.append('video', {
          uri: data.uri,
          type: 'video/mp4',
          name: 'video.mp4',
        });

        // Axios를 사용하여 백엔드로 Multi-part form data를 전송하는 POST 요청을 보냄
        const response = await axios.post(
          '3.34.132.42/video/process-video/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
      // 응답 데이터를 변수에 저장하고, 콘솔에 출력
      const result = response.data;
      console.log("결과입니다...." + result);
    } catch (e) {
      // 오류가 발생한 경우 오류를 콘솔에 출력
      console.error(e);
    }
  }
};

  const stopVideo = async () => {
    camera.stopRecording();
    // camera.current.stopRecording();
    console.log("끝")
  }

  if(hasCameraPermission === null || hasAudioPermission === null) {
    return <View />;
  }

  if (hasCameraPermission === false || hasAudioPermission === false) {
    return <Text>No access to camera</Text>
  }


  return (
    <>
      <View style={{flex:1}}>
        <View style={styles.cameraContainer} >
          <Camera
            ref = {ref => setCamera(ref)}
            style = {styles.fixedRatio}
            type = {type}
            ratio = {'4:3'} />
        </View>
        <Video
          ref = {video}
          style = {styles.video}
          source = {{
            uri: record,
          }}
          useNativeControls
          resizeMode='contain'
          isLooping
          onPlaybackStatusUpdate={status => setStatus(()=>status)}
          />
          <View styles={styles.buttons}>
          {/* <Button title="데이터 전송" onPress={sendDataToServer} /> */}
            <Button 
              title = {status.isPlaying ? 'Pause' : 'Play'}
              onPress={() => 
              status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
            }
            />
          </View>
          <Button
          title = 'Flip Video'
          onPress={()=>{
            setType(
              type === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
            );
          }}
          />
          <Button title="Take Video" onPress={()=>TakeVideo()} />
          <Button title="Stop Video" onPress={()=>stopVideo()} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1
  },
  video: {
    alignSelf: 'center',
    width: 350,
    height: 350,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: 'center',
  }
})