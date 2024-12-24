import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Device from 'expo-device'; // Para obtener el ID del dispositivo

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Función para enviar la ubicación al servidor
  const sendLocationToServer = async (latitude, longitude) => {
    try {
      await fetch('http://10.0.0.116:3000/update-location', { // Cambia por la IP local del servidor
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }), // Enviar solo latitud y longitud
      });
    } catch (error) {
      console.error('Error enviando coordenadas al servidor:', error);
    }
  };

  // Función para obtener la ubicación actual y actualizar el estado
  const updateLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    // Obtener la ubicación actual del dispositivo
    const loc = await Location.getCurrentPositionAsync({});
    if (loc && loc.coords) {
      setLocation(loc);
      sendLocationToServer(loc.coords.latitude, loc.coords.longitude); // Enviar lat, lon al servidor
    } else {
      setErrorMsg('Error obtaining location');
    }
  };

  // useEffect para ejecutar la actualización de ubicación cada 5 segundos
  useEffect(() => {
    const locationInterval = setInterval(updateLocation, 5000); // Llama a updateLocation cada 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(locationInterval);
  }, []); // El arreglo vacío [] asegura que solo se ejecute una vez

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Lat: ${location.coords.latitude.toFixed(6)}, Lon: ${location.coords.longitude.toFixed(6)}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  box: {
    padding: 20,
    backgroundColor: '#4caf50',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
