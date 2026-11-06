package com.infinityboard.keyboard;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.inputmethodservice.InputMethodService;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class InfinityKeyboardService extends InputMethodService {

    private boolean isShifted = false;
    private boolean isSymbols = false;
    private LinearLayout keyboardContainer;
    private float touchStartX = 0;

    @Override
    public View onCreateInputView() {
        keyboardContainer = new LinearLayout(this);
        keyboardContainer.setOrientation(LinearLayout.VERTICAL);
        keyboardContainer.setBackgroundColor(Color.parseColor("#0B0D12"));
        keyboardContainer.setPadding(4, 6, 4, 10);

        int height = (int) (getResources().getDisplayMetrics().heightPixels * 0.33f);
        keyboardContainer.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, height));

        renderKeyboard();
        return keyboardContainer;
    }

    private void renderKeyboard() {
        if (keyboardContainer == null) return;
        keyboardContainer.removeAllViews();

        if (isSymbols) {
            renderSymbols();
        } else {
            renderAlphabet();
        }
    }

    private void renderAlphabet() {
        String[][] rows = {
            {"q", "w", "e", "r", "t", "y", "u", "i", "o", "p"},
            {"a", "s", "d", "f", "g", "h", "j", "k", "l"},
            {"⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"}
        };

        for (int r = 0; r < rows.length; r++) {
            LinearLayout rowLayout = new LinearLayout(this);
            rowLayout.setOrientation(LinearLayout.HORIZONTAL);
            LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
            rowParams.setMargins(0, 2, 0, 2);
            rowLayout.setLayoutParams(rowParams);

            if (r == 1) {
                rowLayout.setPadding(24, 0, 24, 0);
            }

            for (String key : rows[r]) {
                final String label = key;
                Button btn = createKeyButton(label, key.equals("⇧") || key.equals("⌫"));

                if (key.equals("⇧")) {
                    LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
                    p.setMargins(2, 0, 2, 0);
                    btn.setLayoutParams(p);
                    if (isShifted) {
                        btn.setBackgroundColor(Color.parseColor("#0369A1"));
                    }
                    btn.setOnClickListener(v -> {
                        isShifted = !isShifted;
                        renderKeyboard();
                    });
                } else if (key.equals("⌫")) {
                    LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
                    p.setMargins(2, 0, 2, 0);
                    btn.setLayoutParams(p);
                    btn.setOnClickListener(v -> deleteChar());
                } else {
                    String display = isShifted ? key.toUpperCase() : key;
                    btn.setText(display);
                    btn.setOnClickListener(v -> {
                        commitText(display);
                        if (isShifted) {
                            isShifted = false;
                            renderKeyboard();
                        }
                    });
                }
                rowLayout.addView(btn);
            }
            keyboardContainer.addView(rowLayout);
        }

        // Bottom Row: Tab, Comma, Space (with ∞ for swipe left to symbols), Period, Enter
        LinearLayout bottomRow = new LinearLayout(this);
        bottomRow.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams bottomParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        bottomParams.setMargins(0, 2, 0, 2);
        bottomRow.setLayoutParams(bottomParams);

        // Tab
        Button tabBtn = createKeyButton("Tab", true);
        LinearLayout.LayoutParams tabP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.3f);
        tabP.setMargins(2, 0, 2, 0);
        tabBtn.setLayoutParams(tabP);
        tabBtn.setTextSize(13);
        tabBtn.setOnClickListener(v -> commitText("    "));
        bottomRow.addView(tabBtn);

        // Comma
        Button commaBtn = createKeyButton(",", false);
        LinearLayout.LayoutParams commaP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.0f);
        commaP.setMargins(2, 0, 2, 0);
        commaBtn.setLayoutParams(commaP);
        commaBtn.setOnClickListener(v -> commitText(","));
        bottomRow.addView(commaBtn);

        // Spacebar Container (with ∞ on left)
        LinearLayout spaceContainer = new LinearLayout(this);
        spaceContainer.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams spaceP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 5.2f);
        spaceP.setMargins(2, 0, 2, 0);
        spaceContainer.setLayoutParams(spaceP);
        spaceContainer.setBackgroundColor(Color.parseColor("#1E232E"));
        spaceContainer.setGravity(Gravity.CENTER_VERTICAL);

        Button infinityBtn = new Button(this);
        infinityBtn.setText("∞");
        infinityBtn.setTextColor(Color.parseColor("#38BDF8"));
        infinityBtn.setTextSize(18);
        infinityBtn.setBackgroundColor(Color.TRANSPARENT);
        infinityBtn.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.MATCH_PARENT));
        infinityBtn.setOnClickListener(v -> {
            isSymbols = true;
            renderKeyboard();
        });
        spaceContainer.addView(infinityBtn);

        TextView spaceLabel = new TextView(this);
        spaceLabel.setText("SPACE");
        spaceLabel.setTextColor(Color.parseColor("#94A3B8"));
        spaceLabel.setTextSize(11);
        spaceLabel.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams labelP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.0f);
        spaceLabel.setLayoutParams(labelP);
        spaceContainer.addView(spaceLabel);

        // Spacebar swipe left gesture
        spaceContainer.setOnTouchListener((v, event) -> {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    touchStartX = event.getX();
                    return true;
                case MotionEvent.ACTION_UP:
                    float diffX = event.getX() - touchStartX;
                    if (diffX < -60) {
                        isSymbols = true;
                        renderKeyboard();
                    } else if (Math.abs(diffX) < 25) {
                        commitText(" ");
                    }
                    return true;
            }
            return false;
        });
        bottomRow.addView(spaceContainer);

        // Period
        Button periodBtn = createKeyButton(".", false);
        LinearLayout.LayoutParams periodP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.0f);
        periodP.setMargins(2, 0, 2, 0);
        periodBtn.setLayoutParams(periodP);
        periodBtn.setOnClickListener(v -> commitText("."));
        bottomRow.addView(periodBtn);

        // Enter
        Button enterBtn = createKeyButton("↵", true);
        enterBtn.setBackgroundColor(Color.parseColor("#0C4A6E"));
        enterBtn.setTextColor(Color.parseColor("#38BDF8"));
        LinearLayout.LayoutParams enterP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        enterP.setMargins(2, 0, 2, 0);
        enterBtn.setLayoutParams(enterP);
        enterBtn.setOnClickListener(v -> sendKeyChar('\n'));
        bottomRow.addView(enterBtn);

        keyboardContainer.addView(bottomRow);
    }

    private void renderSymbols() {
        String[][] symRows = {
            {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"},
            {"@", "#", "$", "%", "&", "*", "-", "+", "(", ")"},
            {"`", "|", "•", "€", "£", "¥", "∞", "÷", "×", "⌫"}
        };

        for (int r = 0; r < symRows.length; r++) {
            LinearLayout rowLayout = new LinearLayout(this);
            rowLayout.setOrientation(LinearLayout.HORIZONTAL);
            LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
            rowParams.setMargins(0, 2, 0, 2);
            rowLayout.setLayoutParams(rowParams);

            for (String key : symRows[r]) {
                final String sym = key;
                Button btn = createKeyButton(sym, key.equals("⌫"));
                if (key.equals("⌫")) {
                    btn.setOnClickListener(v -> deleteChar());
                } else {
                    btn.setOnClickListener(v -> commitText(sym));
                }
                rowLayout.addView(btn);
            }
            keyboardContainer.addView(rowLayout);
        }

        // Bottom Row for Symbols: ABC, Comma, Space, Period, Enter
        LinearLayout bottomRow = new LinearLayout(this);
        bottomRow.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams bottomParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        bottomParams.setMargins(0, 2, 0, 2);
        bottomRow.setLayoutParams(bottomParams);

        Button abcBtn = createKeyButton("ABC", true);
        LinearLayout.LayoutParams abcP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        abcP.setMargins(2, 0, 2, 0);
        abcBtn.setLayoutParams(abcP);
        abcBtn.setTextSize(13);
        abcBtn.setOnClickListener(v -> {
            isSymbols = false;
            renderKeyboard();
        });
        bottomRow.addView(abcBtn);

        Button commaBtn = createKeyButton(",", false);
        LinearLayout.LayoutParams commaP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.0f);
        commaP.setMargins(2, 0, 2, 0);
        commaBtn.setLayoutParams(commaP);
        commaBtn.setOnClickListener(v -> commitText(","));
        bottomRow.addView(commaBtn);

        Button spaceBtn = createKeyButton("SPACE", false);
        LinearLayout.LayoutParams spaceP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 5.2f);
        spaceP.setMargins(2, 0, 2, 0);
        spaceBtn.setLayoutParams(spaceP);
        spaceBtn.setTextSize(11);
        spaceBtn.setOnClickListener(v -> commitText(" "));
        bottomRow.addView(spaceBtn);

        Button periodBtn = createKeyButton(".", false);
        LinearLayout.LayoutParams periodP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.0f);
        periodP.setMargins(2, 0, 2, 0);
        periodBtn.setLayoutParams(periodP);
        periodBtn.setOnClickListener(v -> commitText("."));
        bottomRow.addView(periodBtn);

        Button enterBtn = createKeyButton("↵", true);
        enterBtn.setBackgroundColor(Color.parseColor("#0C4A6E"));
        enterBtn.setTextColor(Color.parseColor("#38BDF8"));
        LinearLayout.LayoutParams enterP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        enterP.setMargins(2, 0, 2, 0);
        enterBtn.setLayoutParams(enterP);
        enterBtn.setOnClickListener(v -> sendKeyChar('\n'));
        bottomRow.addView(enterBtn);

        keyboardContainer.addView(bottomRow);
    }

    private Button createKeyButton(String text, boolean isSpecial) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(Color.WHITE);
        btn.setTextSize(18);
        btn.setTypeface(Typeface.DEFAULT_BOLD);
        btn.setBackgroundColor(isSpecial ? Color.parseColor("#1E222B") : Color.parseColor("#282E3B"));
        btn.setPadding(0, 0, 0, 0);

        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.0f);
        p.setMargins(2, 0, 2, 0);
        btn.setLayoutParams(p);
        return btn;
    }

    private void commitText(String text) {
        InputConnection ic = getCurrentInputConnection();
        if (ic != null) {
            ic.commitText(text, 1);
        }
    }

    private void deleteChar() {
        InputConnection ic = getCurrentInputConnection();
        if (ic != null) {
            ic.deleteSurroundingText(1, 0);
        }
    }
}
