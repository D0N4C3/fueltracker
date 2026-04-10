// FUEL_QUEUE_TRACKER_APP_NOT_FOUND_V2
import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { MapPin, ArrowLeft } from "lucide-react-native";
import { ThemeColors } from "@/constants/colors";

export default function NotFoundPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MapPin size={48} color={ThemeColors.primary} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>?</Text>
          </View>
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <ArrowLeft size={18} color="white" />
            <Text style={styles.buttonText}>Go Back Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: ThemeColors.background,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ThemeColors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ThemeColors.background,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: ThemeColors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: ThemeColors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 280,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ThemeColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
// TIMESTAMP_1775756619
