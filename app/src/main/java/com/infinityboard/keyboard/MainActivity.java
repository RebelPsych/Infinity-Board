package com.infinityboard.keyboard;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ScrollView scrollView = new ScrollView(this);
        scrollView.setBackgroundColor(Color.parseColor("#090B10"));

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 64, 48, 64);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);

        TextView title = new TextView(this);
        title.setText("Infinity Board");
        title.setTextSize(26);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setTextColor(Color.WHITE);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, 0, 0, 16);
        layout.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("High-contrast dark mode keyboard taking up 1/3 of the screen with standard QWERTY, Tab, Comma, Period, and Spacebar swipe for symbols.");
        subtitle.setTextSize(14);
        subtitle.setTextColor(Color.parseColor("#94A3B8"));
        subtitle.setGravity(Gravity.CENTER);
        subtitle.setPadding(0, 0, 0, 48);
        layout.addView(subtitle);

        // Step 1: Enable Keyboard in Settings
        Button enableBtn = new Button(this);
        enableBtn.setText("Step 1: Enable Infinity Board in Settings");
        enableBtn.setBackgroundColor(Color.parseColor("#1E293B"));
        enableBtn.setTextColor(Color.WHITE);
        enableBtn.setPadding(32, 28, 32, 28);
        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        btnParams.setMargins(0, 0, 0, 24);
        enableBtn.setLayoutParams(btnParams);
        enableBtn.setOnClickListener(v -> {
            Intent intent = new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS);
            startActivity(intent);
        });
        layout.addView(enableBtn);

        // Step 2: Select Keyboard
        Button selectBtn = new Button(this);
        selectBtn.setText("Step 2: Switch to Infinity Board");
        selectBtn.setBackgroundColor(Color.parseColor("#0284C7"));
        selectBtn.setTextColor(Color.WHITE);
        selectBtn.setPadding(32, 28, 32, 28);
        selectBtn.setLayoutParams(btnParams);
        selectBtn.setOnClickListener(v -> {
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.showInputMethodPicker();
            }
        });
        layout.addView(selectBtn);

        // Step 3: Test Area
        TextView testLabel = new TextView(this);
        testLabel.setText("Test Your Keyboard Here:");
        testLabel.setTextSize(14);
        testLabel.setTextColor(Color.parseColor("#38BDF8"));
        testLabel.setPadding(0, 32, 0, 12);
        layout.addView(testLabel);

        EditText testInput = new EditText(this);
        testInput.setHint("Tap here to open Infinity Board overlay...");
        testInput.setHintTextColor(Color.parseColor("#64748B"));
        testInput.setTextColor(Color.WHITE);
        testInput.setBackgroundColor(Color.parseColor("#151821"));
        testInput.setPadding(32, 32, 32, 32);
        testInput.setLayoutParams(btnParams);
        layout.addView(testInput);

        scrollView.addView(layout);
        setContentView(scrollView);
    }
}
