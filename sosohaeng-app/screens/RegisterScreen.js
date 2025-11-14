import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useRouter } from 'expo-router'; 
import apiClient from '../src/config/client';  

export default function RegisterScreen() {
  const router = useRouter(); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [businessNumber, setBusinessNumber] = useState('');

  const handleRegister = async () => {
    if (!email || !password|| !username) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }
    if (isBusiness && businessNumber.length !== 10) {
        alert('사업자 등록 번호를 10자리 숫자로 정확히 입력해주세요.');
        return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/register", { 
        username, 
        email, 
        password,
        is_business: isBusiness,
        business_registration_number: isBusiness ? businessNumber : null, 
      });

      Alert.alert("회원가입 성공", "이제 로그인할 수 있습니다.", [
        { text: "확인", onPress: () => router.push("/login") },
      ]);
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "서버와 연결할 수 없습니다.";
      Alert.alert("회원가입 실패", errorMessage);
      console.error("Register Error:", err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>소소행 회원가입</Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={username}
        onChangeText={setUsername}
        maxLength={30}
      />
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
        placeholder="비밀번호 (8자 이상)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        maxLength={50}
      />

      <View style={styles.toggleContainer}>
        <Text>사업자입니다</Text>
        <Switch
        value={isBusiness}
        onValueChange={setIsBusiness} // isBusiness 상태를 바로 업데이트
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isBusiness ? "#f5dd4b" : "#f4f3f4"}
        />
        </View>
        {isBusiness && (
          <TextInput
          style={styles.input}
          placeholder="사업자 등록 번호 (10자리 숫자)"
          value={businessNumber}
          onChangeText={setBusinessNumber}
          keyboardType="numeric" // 숫자 키보드만 표시
          maxLength={10} // 10자리로 제한
          />
          )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#28a745" }]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text style={styles.buttonText}>회원가입</Text>
        )}
      </TouchableOpacity>

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