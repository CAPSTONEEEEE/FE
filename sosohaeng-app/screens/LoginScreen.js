import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native'; 
import { useRouter } from 'expo-router';
import apiClient from '../src/config/client'; 
import useAuthStore from '../src/stores/authStore';
import { Alert } from "react-native";

export default function LoginScreen() {
  const router = useRouter(); 
  const login = useAuthStore((state) => state.login);
    
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { access_token } = response.data;
      await login(access_token);
      
      Alert.alert("로그인 성공", `${response.data.username}님 환영합니다!`);
      router.replace("/(tabs)/home"); 

    } catch (err) {
      const errorMessage = err.response?.data?.detail || "서버와 연결할 수 없습니다.";
      Alert.alert("로그인 실패", errorMessage);
      console.error("Login Error:", err);
    }
    finally {
        setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>소소행 로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>로그인</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.link}>회원가입하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: { fontSize: 28, marginBottom: 30, fontWeight: "bold" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
  link: { color: "#007BFF", marginTop: 15, fontSize: 14 },
});