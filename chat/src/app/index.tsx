import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'

const HomeScreen = () => {

  const pingBackend = async() => {
    const res = await fetch("http://localhost:3000");
    const data = await res.text();
    console.log(data);
    
  }
  return (
    <View>
      <Text>HomeScreen</Text>
      <Pressable style={styles.btn} onPress={pingBackend}>
        <Text style={{color:'white'}}>Ping backend</Text>
      </Pressable>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  btn:{
    backgroundColor:'black',
    color:"white",
    borderRadius: 10,
    padding: 5
  }
})