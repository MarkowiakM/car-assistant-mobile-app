import { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  Text,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import Ionicons from '@expo/vector-icons/Ionicons';
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { recordSpeech } from "@/functions/recordSpeech";
import useWebFocus from "@/hooks/useWebFocus";
import { getAssistantAnswer } from "@/functions/getAssistantAnswer";
import { useRecoilState } from "recoil";
import { historyState } from "@/state/history";
import SoundWave from "@/components/SoundWave";
import Toast from "react-native-toast-message";
import { Link } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { readText } from "@/functions/readText";

export default function HomeScreen() {
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGettingResponse, setIsGettingResponse] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new Audio.Recording());
  const webAudioPermissionsRef = useRef<MediaStream | null>(null);
  const [history, setHistory] = useRecoilState(historyState);
  const [shadowStyle, setShadowStyle] = useState({});
  const sound = useRef(new Audio.Sound());

  console.log("isRecording: ", isRecording)
  console.log("isTranscribing: ", isTranscribing)
  console.log("isGettingResponse: ", isGettingResponse)
  console.log("isPlaying: ", isPlaying)

  useEffect(() => {
    return sound.current
      ? () => {
        sound.current.unloadAsync();
      }
      : undefined;
  }, []);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useLayoutEffect(() => {
    if (isRecording) {
      setShadowStyle({
        shadowRadius: 30,
        shadowOpacity: 0.5,
        shadowColor: "white",
      });
    } else {
      setShadowStyle({});
    }
  }, [isRecording]);

  useEffect(() => {
    console.log(history);
  }, [history]);

  useEffect(() => {
    if (transcribedSpeech) {
      setIsGettingResponse(true);
      void getAssistantAnswer({ userPrompt: transcribedSpeech, history })
        .then((response) => {
          setHistory([
            ...history,
            { role: "user", parts: [{ text: transcribedSpeech }] },
            { role: "model", parts: [{ text: response.text }] },
          ]);
          return readText(response.text);
        })
        .then(async (audioResponse) => {
          setIsGettingResponse(false);
          console.log(audioResponse);

          try {
            // setIsPlaying(true);
            await sound.current.loadAsync(
              { uri: `data:audio/mp3;base64,${audioResponse.audioContent}` }
            );

            await sound.current.playAsync();

          } catch (error) {
            console.error('Error loading or playing audio', error);
          }
        })
        .catch(() => {
          Toast.show({
            type: "error",
            text1: "Nie udało się odczytać odpowiedzi",
          });
        });
    }
  }, [transcribedSpeech]);
  useEffect(() => {
    if (isWebFocused) {
      const getMicAccess = async () => {
        const permissions = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        webAudioPermissionsRef.current = permissions;
      };
      if (!webAudioPermissionsRef.current) getMicAccess();
    } else {
      if (webAudioPermissionsRef.current) {
        webAudioPermissionsRef.current
          .getTracks()
          .forEach((track) => track.stop());
        webAudioPermissionsRef.current = null;
      }
    }
  }, [isWebFocused]);

  const startRecording = async () => {
    setIsRecording(true);
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      await recordSpeech(
        audioRecordingRef,
        setIsRecording,
        !!webAudioPermissionsRef.current
      );
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };


  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscribedSpeech(speechTranscript || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    Toast.show({
      type: 'success',
      text1: 'Pomyślnie usunięto historię czatu',
    });
  }

  return (
    <SafeAreaView>
      <ScrollView >
        <View className="pt-20 bg-background h-screen text-white flex flex-col items-center justify-center gap-20">
          <Text className="text-white text-3xl mt-auto">Jak mogę ci pomóc?</Text>
          <View className="flex flex-row items-center justify-center h-[80px] gap-1">
            <SoundWave isRecording={isRecording || isPlaying} />
          </View>
          <TouchableOpacity
            style={{
              opacity: isRecording || isTranscribing ? 0.5 : 1,
              ...shadowStyle,
              borderRadius: "100%"
            }}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isRecording || isTranscribing}
          >
            <View className="rounded-full bg-[#7AC0D2]/50 w-[180px] h-[180px] flex items-center justify-center">
              <View className="rounded-full bg-[#B5EBF2] h-[140px] w-[140px] flex items-center justify-center">
                {isTranscribing || isGettingResponse ? (
                  <ActivityIndicator size={40} color="white" />
                ) : (
                  <FontAwesome name="microphone" size={100} />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <View className="mb-10 mt-auto px-10 w-full flex flex-row justify-between gap-2">
            <TouchableOpacity
              onPress={clearHistory}
              className="flex flex-col gap-1 items-center"
            >
              <MaterialIcons name="clear" size={24} className="text-rose-400" />
              <Text className="text-sm text-rose-400 text-center">Wyczyść{"\n"}historię</Text>
            </TouchableOpacity>
            <Link href="/history" className="flex flex-col gap-1 items-center">
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
              <Text className="text-sm text-foreground">Historia</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}
