package com.silentmode.bridge

import android.content.Intent
import com.facebook.react.bridge.*
import com.silentmode.service.OverlayService

class OverlayBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "OverlayBridge"

    @ReactMethod
    fun showOverlay(draftText: String, promise: Promise) {
        val intent = Intent(reactApplicationContext, OverlayService::class.java).apply {
            putExtra("draft_text", draftText)
        }
        reactApplicationContext.startService(intent)
        promise.resolve(true)
    }

    @ReactMethod
    fun hideOverlay(promise: Promise) {
        reactApplicationContext.stopService(Intent(reactApplicationContext, OverlayService::class.java))
        promise.resolve(true)
    }
}