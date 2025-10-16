import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from 'expo-router'; // 👈 1. Expo Router의 useRouter를 import
import apiClient from "../utils/apiClient"; // 👈 2. apiClient를 import

export default function RegisterScreen() {
  const router = useRouter(); // 👈 3. router 객체 생성
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // UI에서는 'name'을 계속 사용
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!email || !name || !password) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }

    try {
      // 👈 4. apiClient를 사용하여 회원가입 API 호출
      const response = await apiClient.post("/users/register", { 
        email, 
        username: name, // 👈 5. 백엔드가 기대하는 'username'으로 이름을 바꿔서 전송
        password 
      });

      Alert.alert("회원가입 성공", "이제 로그인할 수 있습니다.", [
        // 👈 6. router.push를 사용하여 로그인 화면으로 이동
        { text: "확인", onPress: () => router.push("/login") },
      ]);
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "서버와 연결할 수 없습니다.";
      Alert.alert("회원가입 실패", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>소소행 회원가입</Text>
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
        placeholder="이름"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        maxLength={50}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#28a745" }]}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>

      {/* 👈 7. router.push를 사용하여 로그인 화면으로 이동 */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>로그인으로 돌아가기</Text>
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
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
  link: { color: "#007BFF", marginTop: 15, fontSize: 14 },
});