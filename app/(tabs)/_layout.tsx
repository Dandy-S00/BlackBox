import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { palette } from "@/components/workspace-ui";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: palette.teal, tabBarInactiveTintColor: "#7E90A3", tabBarButton: HapticTab, tabBarStyle: { paddingTop: 7, paddingBottom: bottomPadding, height: 58 + bottomPadding, backgroundColor: palette.base, borderTopColor: palette.border, borderTopWidth: 1 }, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" } }}>
    <Tabs.Screen name="index" options={{ title: "Deck", tabBarIcon: ({ color }) => <IconSymbol size={23} name="house.fill" color={color} /> }} />
    <Tabs.Screen name="workspaces" options={{ title: "Workspaces", tabBarIcon: ({ color }) => <IconSymbol size={23} name="folder.fill" color={color} /> }} />
    <Tabs.Screen name="insights" options={{ title: "Insights", tabBarIcon: ({ color }) => <IconSymbol size={23} name="lightbulb.max.fill" color={color} /> }} />
    <Tabs.Screen name="stack" options={{ title: "Stack", tabBarIcon: ({ color }) => <IconSymbol size={23} name="server.rack" color={color} /> }} />
  </Tabs>;
}
