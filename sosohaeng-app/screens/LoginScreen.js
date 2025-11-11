import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../src/config/client'; 

export default function LoginScreen() {
  const router = useRouter(); 
    
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await apiClient.post("/users/login", { email, password });
      
      Alert.alert("로그인 성공", `${response.data.username}님 환영합니다!`);
      router.replace("/(tabs)/home"); 

    } catch (err) {
      const errorMessage = err.response?.data?.detail || "서버와 연결할 수 없습니다.";
      Alert.alert("로그인 실패", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* JSX 안에서는 이런 형태로 여러 줄 주석을 사용해야 합니다.
        슬래시 두 개(//)를 사용하면 텍스트로 인식되어 오류가 발생합니다.
      */}
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
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

/*

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
// apiClient는 지금 사용하지 않으므로 주석 처리하거나 남겨둬도 괜찮습니다.
// import apiClient from '../../src/config/client';  

export default function LoginScreen() {
  const router = useRouter(); 
    
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => { // async 키워드는 지금 필요 없으므로 제거
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    // --- 👇 [임시 수정] 실제 API 호출 부분을 주석 처리합니다. ---
    /*
    try {
      const response = await apiClient.post("/users/login", { email, password });
      
      Alert.alert("로그인 성공", `${response.data.username}님 환영합니다!`);
      router.replace("/(tabs)/home"); 

    } catch (err) {
      const errorMessage = err.response?.data?.detail || "서버와 연결할 수 없습니다.";
      Alert.alert("로그인 실패", errorMessage);
    }
    
    // ----------------------------------------------------

    // --- 👇 [임시 추가] 로그인 성공을 가정하고 바로 홈으로 이동시킵니다. ---
    Alert.alert("로그인 성공 (테스트)", "홈 화면으로 이동합니다.");
    router.replace("/(tabs)/home"); 
    // ----------------------------------------------------
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
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

*/