// screens/SettingsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
  Linking,
  Appearance,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
// ❌ 삭제: import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import TopBackBar from '../components/TopBackBar';

const THEME_KEY = 'pref_theme_override';
const NOTI_KEY = 'pref_notifications_enabled';

export default function SettingsScreen() {
  const router = useRouter();

  // ---------- App info ----------
  const appVersion = useMemo(() => {
    return (
      Constants.expoConfig?.version ||
      Constants.manifest2?.extra?.version ||
      Constants.manifest?.version ||
      '0.0.0'
    );
  }, []);
  const buildNumber = useMemo(() => {
    return (
      Constants.nativeBuildVersion ||
      Constants.expoConfig?.ios?.buildNumber ||
      Constants.expoConfig?.android?.versionCode?.toString?.() ||
      '-'
    );
  }, []);

  // ✅ expo-localization 없이 로케일 라벨 만들기
  const localeLabel = useMemo(() => {
    try {
      // ex) "ko-KR", "en-US"
      const loc = Intl.DateTimeFormat().resolvedOptions().locale || 'system';
      return loc;
    } catch {
      return 'system';
    }
  }, []);

  // ---------- Preferences ----------
  const systemColor = Appearance.getColorScheme?.() || 'light';
  const [themePref, setThemePref] = useState('system'); // 'light' | 'dark' | 'system'
  const effectiveTheme = themePref === 'system' ? systemColor : themePref;
  const [notiEnabled, setNotiEnabled] = useState(true);
  const [notiStatus, setNotiStatus] = useState('unknown'); // 'granted' | 'denied' | 'undetermined' | 'unknown'
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    (async () => {
      const savedTheme = (await AsyncStorage.getItem(THEME_KEY)) || 'system';
      setThemePref(savedTheme);
      const savedNoti = await AsyncStorage.getItem(NOTI_KEY);
      if (savedNoti !== null) setNotiEnabled(savedNoti === 'true');

      const perms = await Notifications.getPermissionsAsync();
      setNotiStatus(perms.status || 'unknown');

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    })();
  }, []);

  // ---------- Navigation ----------
  const onPressFavorite = () => router.push('/favorites');
  const navigateNotices = () => router.push('/settings/notices');
  const navigateAccount = () => router.push('/settings/account');
  const navigateLanguage = () => router.push('/settings/language');
  const navigateAbout = () => router.push('/settings/about');

  // ---------- Cache ----------
  const clearCache = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await AsyncStorage.clear();
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        try { await FileSystem.deleteAsync(cacheDir, { idempotent: true }); } catch {}
        try { await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true }); } catch {}
      }
      Alert.alert('완료', '캐시 데이터가 삭제되었어요.');
    } catch (e) {
      Alert.alert('오류', '캐시 삭제 중 문제가 발생했어요.');
    } finally {
      setClearing(false);
    }
  };
  const confirmClearCache = () =>
    Alert.alert('캐시 삭제', '저장된 임시 데이터(이미지/목록 등)를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: clearCache },
    ]);

  // ---------- Notifications ----------
  const requestNotificationPerms = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotiStatus(status);
    if (status === 'granted') {
      // TODO: 서버에 푸시 토큰 등록
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
      // await api.registerPushToken(token);
      Alert.alert('알림 허용됨', '중요 소식을 푸시로 알려드릴게요!');
    } else {
      Alert.alert('권한 필요', '알림을 받으려면 OS 설정에서 권한을 허용해주세요.');
    }
  };
  const toggleNotiEnabled = async (val) => {
    setNotiEnabled(val);
    await AsyncStorage.setItem(NOTI_KEY, val ? 'true' : 'false');
    if (val) {
      if (notiStatus !== 'granted') await requestNotificationPerms();
      // else TODO: 구독 로직
    } else {
      // TODO: 구독 해제 로직
    }
  };
  const openOSSettings = () => Linking.openSettings?.();

  // ---------- Theme ----------
  const toggleDarkMode = async (val) => {
    const next = val ? 'dark' : 'light';
    setThemePref(next);
    await AsyncStorage.setItem(THEME_KEY, next);
    // TODO: 전역 테마 상태 갱신
  };
  const useSystemTheme = async () => {
    setThemePref('system');
    await AsyncStorage.setItem(THEME_KEY, 'system');
    // TODO: 전역 테마 상태 갱신
  };

  // ---------- Auth ----------
  const logout = async () => {
    // TODO
    router.replace('/auth/login');
  };
  const confirmLogout = () =>
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);

  const deleteAccount = async () => {
    // TODO
    Alert.alert('탈퇴 완료', '계정이 삭제되었어요.');
    router.replace('/auth/welcome');
  };
  const confirmDeleteAccount = () =>
    Alert.alert('탈퇴하기', '계정 및 데이터가 영구 삭제됩니다. 진행할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '탈퇴', style: 'destructive', onPress: deleteAccount },
    ]);

  return (
    <SafeAreaView style={styles.page}>
      <TopBackBar
        title="설정"
        right={
          <TouchableOpacity
            onPress={onPressFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* GENERAL */}
        <SectionTitle title="GENERAL" />
        <ListRow icon="newspaper-outline" label="Notices" onPress={navigateNotices} />
        <ListRow icon="language-outline" label="Language" rightText={localeLabel} onPress={navigateLanguage} />
        <ListRow icon="trash-outline" label={clearing ? 'Clearing cache…' : 'Clear cache'} onPress={confirmClearCache} disabled={clearing} />

        {/* PREFERENCES */}
        <SectionTitle title="PREFERENCES" />
        <ListRowWithSwitch
          icon="notifications-outline"
          label="Push notifications"
          value={notiEnabled}
          onValueChange={toggleNotiEnabled}
          rightSubText={
            notiStatus === 'granted' ? 'Allowed' : notiStatus === 'denied' ? 'Denied' : 'Ask'
          }
        />
        <ListRowWithSwitch
          icon="moon-outline"
          label={themePref === 'system' ? `Dark mode (System: ${systemColor === 'dark' ? 'Dark' : 'Light'})` : 'Dark mode'}
          value={effectiveTheme === 'dark'}
          onValueChange={toggleDarkMode}
          rightSubText={themePref === 'system' ? 'System' : themePref}
        />
        <ListRow icon="phone-portrait-outline" label="Use system theme" rightText={systemColor === 'dark' ? 'Dark' : 'Light'} onPress={useSystemTheme} />

        {/* PRIVACY & PERMISSIONS */}
        <SectionTitle title="PRIVACY & PERMISSIONS" />
        <ListRow icon="shield-checkmark-outline" label="Open app permissions" rightText={Platform.OS === 'ios' ? 'iOS Settings' : 'Android Settings'} onPress={openOSSettings} />

        {/* ACCOUNT */}
        <SectionTitle title="ACCOUNT" />
        <ListRow icon="person-circle-outline" label="Account & Profile" onPress={navigateAccount} />
        <ListRow icon="log-out-outline" label="Log out" danger onPress={confirmLogout} />
        <ListRow icon="skull-outline" label="Delete account" danger onPress={confirmDeleteAccount} />

        {/* ABOUT */}
        <SectionTitle title="ABOUT" />
        <ListRow icon="information-circle-outline" label="About / Licenses" onPress={navigateAbout} />
        <View style={styles.versionBox}>
          <Text style={styles.versionText}>
            Version {appVersion} {buildNumber !== '-' ? `(build ${buildNumber})` : ''}
          </Text>
          <Text style={styles.versionSub}>
            {Platform.select({ ios: 'iOS', android: 'Android', default: 'App' })} • {Constants.appOwnership || 'standalone'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- UI Bits ---------- */
function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}
function ListRow({ icon, label, rightText, onPress, disabled, danger }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={disabled} style={[styles.row, disabled && { opacity: 0.6 }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={danger ? '#d9534f' : '#111'} style={{ width: 24 }} />
        <Text style={[styles.rowLabel, danger && { color: '#d9534f' }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {rightText ? <Text style={styles.rowRightText}>{rightText}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color="#bbb" />
      </View>
    </TouchableOpacity>
  );
}
function ListRowWithSwitch({ icon, label, value, onValueChange, rightSubText, danger }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={danger ? '#d9534f' : '#111'} style={{ width: 24 }} />
        <View>
          <Text style={[styles.rowLabel, danger && { color: '#d9534f' }]}>{label}</Text>
          {rightSubText ? <Text style={styles.rowRightText}>{rightSubText}</Text> : null}
        </View>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginTop: 18, marginBottom: 8, letterSpacing: 0.6 },
  row: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 16, color: '#111' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowRightText: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  versionBox: { paddingVertical: 16, alignItems: 'flex-start' },
  versionText: { fontSize: 13, color: '#374151', marginBottom: 2 },
  versionSub: { fontSize: 12, color: '#9ca3af' },
});