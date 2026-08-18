import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;
const MAPPING = {
  "house.fill": "home", "folder.fill": "folder", "folder.badge.plus": "create-new-folder", "lightbulb.max.fill": "lightbulb", "server.rack": "dns", "chevron.left.forwardslash.chevron.right": "code", "chevron.right": "chevron-right", "chevron.left": "chevron-left", "plus": "add", "plus.circle": "add-circle-outline", "circle": "radio-button-unchecked", "checkmark.circle.fill": "check-circle", "checkmark.shield": "verified-user", "lock.shield": "security", "gearshape": "settings", "trash": "delete-outline", "archivebox": "archive", "doc.text": "description", "square.and.pencil": "edit-note", "xmark.circle": "cancel",
} as IconMapping;
export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) { return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />; }
