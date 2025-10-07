// components/CustomTabBar.js
import React from "react";
import { View, TouchableOpacity, Text, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ICONS = {
  recommend: { active: "sparkles", inactive: "sparkles-outline", label: "추천" },
  festivals: { active: "balloon", inactive: "balloon-outline", label: "축제" }, // 마음에 드는 걸로 교체 가능
  market:    { active: "bag",     inactive: "bag-outline",      label: "마켓" },
  settings:  { active: "settings",inactive: "settings-outline",  label: "설정" },
};

const shadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  android: { elevation: 12 },
});

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 탭 버튼으로 그릴 라우트(가운데 FAB용 home은 숨김)
  const visible = state.routes.filter((r) =>
    ["recommend", "festivals", "market", "settings"].includes(r.name)
  );

  const isFocused = (name) => state.routes[state.index]?.name === name;
  const onPress = (route) => {
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name);
  };

  // 좌/우 2개씩 배치하고 가운데에 빈 공간 -> 그 위에 FAB
  const left = visible.slice(0, 2);
  const right = visible.slice(2);

  const TAB_HEIGHT = 64;

  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" }}>
      {/* 바디(둥근 카드) */}
      <View
        style={[
          {
            height: TAB_HEIGHT,
            width: "92%",
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginHorizontal: 16,
            paddingBottom: Math.max(insets.bottom - 6, 6),
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
          shadow,
        ]}
      >
        {/* 왼쪽 2개 */}
        <View style={{ flexDirection: "row", width: "40%", justifyContent: "space-evenly" }}>
          {left.map((route) => {
            const meta = ICONS[route.name]; const focused = isFocused(route.name);
            return (
              <TouchableOpacity key={route.key} onPress={() => onPress(route)} activeOpacity={0.8}
                style={{ alignItems: "center", gap: 4 }}>
                <Ionicons name={focused ? meta.active : meta.inactive} size={22}
                  color={focused ? "#1f7a8c" : "#b4c0c6"} />
                <Text style={{ fontSize: 11, color: focused ? "#1f7a8c" : "#b4c0c6" }}>
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 가운데 빈 공간 (FAB가 겹침) */}
        <View style={{ width: 72 }} />

        {/* 오른쪽 2개 */}
        <View style={{ flexDirection: "row", width: "40%", justifyContent: "space-evenly" }}>
          {right.map((route) => {
            const meta = ICONS[route.name]; const focused = isFocused(route.name);
            return (
              <TouchableOpacity key={route.key} onPress={() => onPress(route)} activeOpacity={0.8}
                style={{ alignItems: "center", gap: 4 }}>
                <Ionicons name={focused ? meta.active : meta.inactive} size={22}
                  color={focused ? "#1f7a8c" : "#b4c0c6"} />
                <Text style={{ fontSize: 11, color: focused ? "#1f7a8c" : "#b4c0c6" }}>
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 가운데 원형 홈(FAB) 버튼 */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => router.push("/(tabs)/home")}
        style={[
          {
            position: "absolute",
            bottom: TAB_HEIGHT - 46 + Math.max(insets.bottom - 6, 6),
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
          },
          shadow,
        ]}
      >
        <View
          style={{
            width: 64, height: 64, borderRadius: 32, overflow: "hidden",
            backgroundColor: "#e4f3f6", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* 로고 이미지는 프로젝트 경로에 맞춰 필요시 교체 */}
          <Image source={require("../assets/icon.png")} style={{ width: 44, height: 44, resizeMode: "contain" }} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
