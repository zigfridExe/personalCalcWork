import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAwareScrollViewProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  enableOnAndroid?: boolean;
  extraScrollHeight?: number;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
}

const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  children,
  style,
  contentContainerStyle,
  enableOnAndroid = true,
  extraScrollHeight = 100,
  keyboardShouldPersistTaps = 'handled',
  ...props
}) => {
  if (Platform.OS === 'ios') {
    return (
      <RNKeyboardAwareScrollView
        style={[styles.container, style]}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        extraScrollHeight={extraScrollHeight}
        enableOnAndroid={enableOnAndroid}
        enableResetScrollToCoords={false}
        {...props}
      >
        {children}
      </RNKeyboardAwareScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === ('ios' as any) ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === ('ios' as any) ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
});

export default KeyboardAwareScrollView;
