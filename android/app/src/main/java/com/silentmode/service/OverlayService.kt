package com.silentmode.service

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.silentmode.R

class OverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: android.view.View? = null
    private var draftText: String? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        draftText = intent?.getStringExtra("draft_text")
        if (draftText == null) {
            stopSelf()
            return START_NOT_STICKY
        }
        showOverlay()
        return START_STICKY
    }

    private fun showOverlay() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        val inflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
        overlayView = inflater.inflate(R.layout.overlay_popup, null)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply { gravity = Gravity.CENTER or Gravity.TOP; y = 100 }

        val draftTextView = overlayView?.findViewById<TextView>(R.id.draft_text)
        draftTextView?.text = draftText

        val approveButton = overlayView?.findViewById<Button>(R.id.approve_button)
        approveButton?.setOnClickListener { stopSelf() }

        val skipButton = overlayView?.findViewById<Button>(R.id.skip_button)
        skipButton?.setOnClickListener { stopSelf() }

        windowManager?.addView(overlayView, params)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (overlayView != null) windowManager?.removeView(overlayView)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}