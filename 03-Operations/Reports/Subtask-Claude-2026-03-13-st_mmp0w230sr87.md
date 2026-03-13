# RPGPO Builder Prompt — Manual Execution Required
## Implement Initial Optimization
## Stage: implement
## Reason: Claude CLI had no output for 180s (hung)
## Duration: 180s
## Output received: 0 bytes, 1 lines
## Working Directory: /Users/rpgpo/Projects/RPGPO/02-Projects/TopRanker/source-repo
## Target Files: 02-Projects/TopRanker/source-repo/app/_layout.tsx, 02-Projects/TopRanker/source-repo/app/(tabs)/index.tsx, 02-Projects/TopRanker/source-repo/app/_layout.tsx, 02-Projects/TopRanker/source-repo/app/(tabs)/index.tsx

Implement the chosen optimization strategy to improve the startup performance of the TopRanker app.

## Reference Files

### 02-Projects/TopRanker/source-repo/app/_layout.tsx
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from "@expo-google-fonts/dm-sans";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
} from "@expo-google-fonts/playfair-display";
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { StyleSheet, View, Text, Dimensions, StatusBar, Platform, AppState, AccessibilityInfo } from "react-native";
import * as Notifications from "expo-notifications";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, withSpring, Easing, runOnJS,
} from "react-native-reanimated";
import { BRAND } from "@/constants/brand";
import { LeaderboardMark } from "@/components/Logo";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
import { CityProvider } from "@/lib/city-context";
import { BookmarksProvider } from "@/lib/bookmarks-context";
import { ThemeProvider } from "@/lib/theme-context";
import Colors from "@/constants/colors";
// Lazy load non-critical overlay components to improve startup performance
const NetworkBanner = lazy(() => import("@/components/NetworkBanner").then(m => ({ default: m.NetworkBanner })));
const CookieConsent = lazy(() => import("@/components/CookieConsent").then(m => ({ default: m.CookieConsent })));
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications, isValidDeepLinkScreen } from "@/lib/notifications";
import { in

### 02-Projects/TopRanker/source-repo/app/(tabs)/index.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, Modal,
  TextInput, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { hapticPullRefresh, hapticPress } from "@/lib/audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import { getAvailableCuisines, CUISINE_DISPLAY } from "@/shared/best-in-categories";
import { useDishShortcuts } from "@/lib/hooks/useDishShortcuts";
import { fetchLeaderboard, fetchCategories, fetchNeighborhoods, submitCategorySuggestion } from "@/lib/api";
import { SuggestCategory } from "@/components/categories/SuggestCategory";
import { formatTimeAgo } from "@/lib/data";
import { AppLogo } from "@/components/Logo";
import { LeaderboardSkeleton, SkeletonToContent } from "@/components/Skeleton";
import { useCity, SUPPORTED_CITIES } from "@/lib/city-context";
import { pct } from "@/lib/style-helpers";
import { MappedBusiness } from "@/types/business";
import { RankedCard } from "@/components/leaderboard/SubComponents";
import { RankingsListHeader } from "@/components/leaderboard/RankingsListHeader";
import { CuisineChipRow } from "@/components/leaderboard/CuisineChipRow";
import { LeaderboardFilterChips } from "@/components/leaderboard/LeaderboardFilterChips";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState } from "@/components/NetworkBanner";
import { FadeInView } from "@/components/animations/FadeInView";
import { TopRankHighlight } from "@/components/animations/TopRankHighlight";
import EmptyStateAnimation from "@/components/animations/EmptyStateAnimation";
import { useOfflineAware } from "@/lib/

