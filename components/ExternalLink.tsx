import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

export function ExternalLink(
  props: { href: string; children: React.ReactNode; style?: any; textStyle?: any }
) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        if (props.href.startsWith('/')) {
          navigation.navigate(props.href.substring(1));
        } else {
          WebBrowser.openBrowserAsync(props.href);
        }
      }}
    />
  );
}
