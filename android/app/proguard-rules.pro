# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# We don't care about SLF4J at runtime
-dontwarn org.slf4j.**

# Treat logging as no-op so R8 can safely drop it
-assumenosideeffects class org.slf4j.Logger {
    public void trace(...);
    public void debug(...);
    public void info(...);
    public void warn(...);
    public void error(...);
    public boolean isTraceEnabled();
    public boolean isDebugEnabled();
    public boolean isInfoEnabled();
    public boolean isWarnEnabled();
    public boolean isErrorEnabled();
}

# Keep videocache itself (optional, avoids over-shrinking)
-keep class com.danikula.videocache.** { *; }

-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivity$g
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter$Args
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter$Error
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningEphemeralKeyProvider