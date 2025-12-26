#!/bin/bash
set -e

# Default to both platforms if no argument provided
PLATFORM=${1:-"both"}

if [ "$PLATFORM" != "i" ] && [ "$PLATFORM" != "a" ] && [ "$PLATFORM" != "both" ]; then
    echo "❌ Invalid platform: $PLATFORM"
    echo "   Usage: ./deploy-local.sh [platform]"
    echo "   i    - iOS only"
    echo "   a    - Android only"
    echo "   (no arg) - Both platforms"
    exit 1
fi

echo "🚀 Starting Local Deployment..."

# Use Java 17 for Android builds (required for compatibility)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home

# Increase Gradle memory to prevent OutOfMemoryError
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=1g"

echo "☕ Using Java: $JAVA_HOME"
echo "📊 Gradle memory: $GRADLE_OPTS"

# -----------------
# iOS Build & Submit
# -----------------
if [ "$PLATFORM" == "i" ] || [ "$PLATFORM" == "both" ]; then
    echo "🍎 Building iOS (Local)..."
    eas build --platform ios --profile production --local --output ios-build.ipa

    echo "📤 Submitting iOS to App Store Connect..."
    eas submit --platform ios --path ios-build.ipa

    echo "🧹 Cleaning up iOS build..."
    rm ios-build.ipa

    echo "✅ iOS done!"
fi

# -----------------
# Android Build & Submit
# -----------------
if [ "$PLATFORM" == "a" ] || [ "$PLATFORM" == "both" ]; then
    echo "🤖 Building Android (Local)..."
    eas build --platform android --profile production --local --output android-build.aab

    echo "📤 Submitting Android to Google Play..."
    eas submit --platform android --path android-build.aab

    echo "🧹 Cleaning up Android build..."
    rm android-build.aab

    echo "✅ Android done!"
fi

echo "✨ All done! Builds submitted and artifacts removed."
