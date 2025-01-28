import { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  Text,
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet
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
import { getCurrentLocation } from "@/functions/getLocation";

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
  const [location, setLocation] = useState<{lat: number, lon: number} | undefined>();
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
    sound.current.unloadAsync();
    void getCurrentLocation().then(setLocation);
  }, [history]);

  const isActionsDisabled = isRecording || isTranscribing || isPlaying || isGettingResponse;

  useEffect(() => {
    
    if (transcribedSpeech) {
      setIsGettingResponse(true);
      
      void getAssistantAnswer({ userPrompt: transcribedSpeech, history, location: location ?? undefined })
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

          try {
            setIsPlaying(true);
            await sound.current.unloadAsync();
            await sound.current.loadAsync(
              { uri: `data:audio/mp3;base64,${audioResponse.audioContent}` }
            );
            const status = await sound.current.getStatusAsync();
            const audioDuration = status?.durationMillis ?? 0;

            await sound.current.playAsync();

            setTimeout(() => {
              setIsPlaying(false);
            }, audioDuration);

          } catch (error) {
            console.error('Error loading or playing audio', error);
          }
        })
        .catch(() => {
          setIsGettingResponse(false);
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
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>Jak mogę ci pomóc?</Text>
          <View style={styles.soundWaveContainer}>
            <SoundWave isRecording={isRecording || isPlaying} />
          </View>
          <View style={styles.recordButtonContainer}>
            <TouchableOpacity
              style={[styles.recordButton, { opacity: isActionsDisabled ? 0.5 : 1, ...shadowStyle }]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
              disabled={isActionsDisabled}
            >
              <View style={styles.innerRecordButton}>
                <View style={styles.microphoneButton}>
                  {isTranscribing || isGettingResponse ? (
                    <ActivityIndicator size={40} color="white" />
                  ) : (
                    <FontAwesome name="microphone" size={100} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={stopRecording}
              disabled={isActionsDisabled}
              style={styles.stopRecordingButton}
            >
              {isRecording && (
                <MaterialIcons name="pause-circle-outline" size={40} style={styles.pauseIcon} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.bottomActions}>
            <TouchableOpacity
              onPress={clearHistory}
              style={styles.historyButton}
              disabled={isActionsDisabled}
            >
              <MaterialIcons name="clear" size={30} style={styles.clearIcon} />
              <Text style={styles.clearHistoryText}>Wyczyść{"\n"}historię</Text>
            </TouchableOpacity>
            <Link href="/history" style={styles.historyLink} disabled={isActionsDisabled}>
            <View style={styles.historyButton}>
              <Ionicons name="chatbubble-ellipses-outline" size={30} color="white" style={styles.historyIcon} />
              <Text style={styles.historyText}>Historia</Text>
            </View>
            </Link>
          </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    display: 'flex',
    flex: 1,
    padding: 20,
    backgroundColor: '#172026',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 80,
  },
  header: {
    fontSize: 32,
    color: 'white',
    marginBottom: 20,
    marginTop: 60,
  },
  soundWaveContainer: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
  },
  recordButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  recordButton: {
    borderRadius: 100,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7AC0D2',
  },
  innerRecordButton: {
    borderRadius: 100,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B5EBF2',
  },
  microphoneButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopRecordingButton: {
    height: 40,
  },
  pauseIcon: {
    color: '#F87171',
  },
  bottomActions: {
    marginBottom: 20,
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  historyButton: {
    alignItems: 'center',
    gap: 1,
  },
  historyLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  clearIcon: {
    color: '#F87171', // Rose color
  },
  clearHistoryText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#F87171', // Rose color for clear and white for history link
  },
  historyText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white', // Rose color for clear and white for history link
  },
  historyIcon: {
    marginLeft: 2,
    alignSelf: 'center',
  },
});