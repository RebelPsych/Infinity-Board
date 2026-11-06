#!/usr/bin/env bash
set -e

echo "=== Building Infinity Board Android Keyboard APK ==="

mkdir -p /tmp/classes /tmp/dex build-outputs public/downloads
rm -rf /tmp/classes/* /tmp/dex/* /tmp/*.apk

# Ensure Android SDK jar and D8 compiler are available
if [ ! -f /tmp/android.jar ]; then
    echo "Downloading android.jar..."
    curl -fL -o /tmp/android.jar "https://github.com/Sable/android-platforms/raw/master/android-30/android.jar"
fi

if [ ! -f /tmp/r8.jar ]; then
    echo "Downloading D8 compiler..."
    curl -fL -o /tmp/r8.jar "https://dl.google.com/android/maven2/com/android/tools/r8/8.2.33/r8-8.2.33.jar"
fi

# Step 1: Generate R.java
echo "1. Generating R.java..."
aapt package -f -m \
    -J app/src/main/java \
    -M app/src/main/AndroidManifest.xml \
    -S app/src/main/res \
    -I /tmp/android.jar

# Step 2: Compile Java classes
echo "2. Compiling Java sources..."
javac -d /tmp/classes \
    -cp /tmp/android.jar \
    app/src/main/java/com/infinityboard/keyboard/*.java

# Step 3: Convert bytecode to DEX
echo "3. Compiling to DEX bytecode..."
java -cp /tmp/r8.jar com.android.tools.r8.D8 \
    --min-api 21 \
    --lib /tmp/android.jar \
    --output /tmp/dex \
    /tmp/classes/com/infinityboard/keyboard/*.class

# Step 4: Package resource table and binary AndroidManifest.xml
echo "4. Packaging APK resources..."
aapt package -f \
    -M app/src/main/AndroidManifest.xml \
    -S app/src/main/res \
    -I /tmp/android.jar \
    -F /tmp/unaligned.apk

# Step 5: Add DEX into the APK
echo "5. Adding DEX..."
(cd /tmp/dex && aapt add /tmp/unaligned.apk classes.dex)

# Step 6: 4-byte page align with zipalign
echo "6. Aligning APK..."
zipalign -f -p 4 /tmp/unaligned.apk /tmp/aligned.apk

# Step 7: Sign with debug key using apksigner (v1, v2, v3 schemes)
echo "7. Signing APK..."
if [ ! -f /tmp/debug.keystore ]; then
    keytool -genkeypair -v \
        -keystore /tmp/debug.keystore \
        -alias androiddebugkey \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass android \
        -keypass android \
        -dname "CN=Android Debug,O=Android,C=US"
fi

apksigner sign \
    --ks /tmp/debug.keystore \
    --ks-pass pass:android \
    --key-pass pass:android \
    --out build-outputs/app-test.apk \
    /tmp/aligned.apk

# Copy to other target locations
cp build-outputs/app-test.apk build-outputs/app-debug.apk
cp build-outputs/app-test.apk build-outputs/app-debug.APK
cp build-outputs/app-test.apk public/downloads/app-test.apk
cp build-outputs/app-test.apk public/downloads/app-debug.apk
cp build-outputs/app-test.apk public/downloads/app-debug.APK

echo "8. Verifying signatures..."
apksigner verify -v build-outputs/app-test.apk

echo "=== Build Complete: build-outputs/app-test.apk ==="
ls -lh build-outputs/
