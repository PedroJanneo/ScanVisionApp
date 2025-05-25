import axios from 'axios';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.8,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2196F3',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  errorText: {
    color: '#f44336',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  }
});

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);

  const BACKEND_URL = Platform.select({
    web: 'http://localhost:5000/analyze',
    default: 'http://10.0.65.109:5000/analyze' // Local IP for mobile
  });

  // Verificar permissões ao iniciar o app
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'web') {
        setError('Camera access not supported on web - please use gallery');
        return;
      }

      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        setCameraVisible(true);
      } else {
        setError('Precisamos de permissão para acessar a câmera');
        setHasPermission(false);
        setCameraVisible(false);
      }
    } catch (err) {
      console.error('Erro ao solicitar permissão:', err);
      setError('Erro ao solicitar permissão da câmera');
      setHasPermission(false);
      setCameraVisible(false);
    }
  };

  // Take picture
  const takePicture = async () => {
    if (!cameraRef.current) {
      setError('Câmera não inicializada');
      return;
    }

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      setImage(photo.uri);
      setCameraVisible(false);
      await analyzeImage();
    } catch (err) {
      console.error('Erro ao tirar foto:', err);
      setError('Erro ao tirar foto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      setError('Error selecting image: ' + err.message);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      setError('Please select or take a photo first');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      let localUri = image;
      let filename = localUri.split('/').pop() || "photo.jpg";
      let match = /\.(\w+)$/.exec(filename);
              const ext = filename?.split(".").pop();
      let type =  `image/${ext}`;

      if (Platform.OS === 'web') {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('image', blob, filename);
      } else {
        formData.append('image', {
          uri: localUri?.startsWith("file://") ? localUri : `file://${localUri}`,
          name: `${filename}` ?? "upload.jpg",
          type: type === "image/jpg" ? "image/jpeg" : type ?? "image/jpeg",
        });
      }

      const response = await axios.post(BACKEND_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const processedData = processAnalysisResult(response.data);
      setAnalysisResult(processedData);
    } catch (err) {
      setError('Error analyzing image: ' + (err.response?.data?.error || err.message));
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processAnalysisResult = (data) => {
    if (!data) return null;
    
    // Handle gender object
    if (data.gender && typeof data.gender === 'object') {
      const genderEntries = Object.entries(data.gender);
      if (genderEntries.length > 0) {
        const dominantGender = genderEntries.reduce((a, b) => a[1] > b[1] ? a : b);
        data.dominant_gender = dominantGender[0];
        data.gender_confidence = dominantGender[1].toFixed(1);
      }
    }

    // Handle emotion object
    if (data.emotion && typeof data.emotion === 'object') {
      const emotionEntries = Object.entries(data.emotion);
      if (emotionEntries.length > 0) {
        const dominantEmotion = emotionEntries.reduce((a, b) => a[1] > b[1] ? a : b);
        data.dominant_emotion = dominantEmotion[0];
        data.emotion_confidence = dominantEmotion[1].toFixed(1);
      }
    }

    return data;
  };

  // Render gender information
  const renderGenderInfo = (genderData) => {
    if (!genderData) return null;
    
    if (typeof genderData === 'object') {
      return (
        <View>
          <Text>Gender Analysis:</Text>
          {Object.entries(genderData).map(([gender, value]) => (
            <Text key={gender}>{gender}: {value.toFixed(1)}%</Text>
          ))}
        </View>
      );
    }
    
    return <Text>Gender: {genderData}</Text>;
  };

  // Render emotion information
  const renderEmotionInfo = (emotionData) => {
    if (!emotionData) return null;
    
    if (typeof emotionData === 'object') {
      return (
        <View>
          <Text>Emotion Analysis:</Text>
          {Object.entries(emotionData).map(([emotion, value]) => (
            <Text key={emotion}>{emotion}: {value.toFixed(1)}%</Text>
          ))}
        </View>
      );
    }
    
    return <Text>Emotion: {emotionData}</Text>;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Análise Facial</Text>
        <Text style={styles.subtitle}>Detecção de emoções e características faciais</Text>
      </View>

      <View style={styles.content}>
        {cameraVisible && hasPermission ? (
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              enableTorch={false}
              enableZoomGesture={false}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#4CAF50' }]}
                onPress={takePicture}
              >
                <Text style={styles.buttonText}>Tirar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#f44336' }]}
                onPress={() => setCameraVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button}
                onPress={requestCameraPermission}
              >
                <Text style={styles.buttonText}>Abrir Câmera</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button}
                onPress={pickImage}
              >
                <Text style={styles.buttonText}>Galeria</Text>
              </TouchableOpacity>
            </View>

            {image && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.image}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.analyzeButton}
                  onPress={analyzeImage}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Analisar Face</Text>
                </TouchableOpacity>
              </View>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
              </View>
            )}

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {analysisResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Resultados da Análise</Text>
                <View>
                  <Text style={styles.resultText}>Idade: {analysisResult.age} anos</Text>
                  {renderGenderInfo(analysisResult.gender)}
                  <Text style={styles.resultText}>Emoção Dominante: {analysisResult.dominant_emotion}</Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}