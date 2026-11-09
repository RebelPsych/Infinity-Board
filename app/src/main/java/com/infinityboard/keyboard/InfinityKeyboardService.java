package com.infinityboard.keyboard;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.inputmethodservice.InputMethodService;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputConnection;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.HashMap;
import java.util.Map;

public class InfinityKeyboardService extends InputMethodService {

    private boolean isSymbols = false;
    private boolean isShifted = false;
    private boolean isCapsLock = false;
    private long lastShiftTapTime = 0;
    private LinearLayout keyboardContainer;

    private static final Map<String, String> AUTOCORRECT_MAP = new HashMap<>();
    static {
        AUTOCORRECT_MAP.put("teh", "the");
        AUTOCORRECT_MAP.put("thsi", "this");
        AUTOCORRECT_MAP.put("taht", "that");
        AUTOCORRECT_MAP.put("waht", "what");
        AUTOCORRECT_MAP.put("wich", "which");
        AUTOCORRECT_MAP.put("wiht", "with");
        AUTOCORRECT_MAP.put("adn", "and");
        AUTOCORRECT_MAP.put("recieve", "receive");
        AUTOCORRECT_MAP.put("recieved", "received");
        AUTOCORRECT_MAP.put("seperate", "separate");
        AUTOCORRECT_MAP.put("definately", "definitely");
        AUTOCORRECT_MAP.put("untill", "until");
        AUTOCORRECT_MAP.put("becuase", "because");
        AUTOCORRECT_MAP.put("becasue", "because");
        AUTOCORRECT_MAP.put("wierd", "weird");
        AUTOCORRECT_MAP.put("beleive", "believe");
        AUTOCORRECT_MAP.put("occured", "occurred");
        AUTOCORRECT_MAP.put("acommodate", "accommodate");
        AUTOCORRECT_MAP.put("tomorow", "tomorrow");
        AUTOCORRECT_MAP.put("alot", "a lot");
        AUTOCORRECT_MAP.put("freind", "friend");
        AUTOCORRECT_MAP.put("peolpe", "people");
        AUTOCORRECT_MAP.put("dont", "don't");
        AUTOCORRECT_MAP.put("cant", "can't");
        AUTOCORRECT_MAP.put("wont", "won't");
        AUTOCORRECT_MAP.put("didnt", "didn't");
        AUTOCORRECT_MAP.put("isnt", "isn't");
        AUTOCORRECT_MAP.put("arent", "aren't");
        AUTOCORRECT_MAP.put("wasnt", "wasn't");
        AUTOCORRECT_MAP.put("im", "I'm");
        AUTOCORRECT_MAP.put("ive", "I've");
        AUTOCORRECT_MAP.put("ill", "I'll");
        AUTOCORRECT_MAP.put("id", "I'd");
        AUTOCORRECT_MAP.put("i", "I");
        AUTOCORRECT_MAP.put("youre", "youre");
        AUTOCORRECT_MAP.put("theyre", "they're");
        AUTOCORRECT_MAP.put("thats", "that's");
    }

    @Override
    public View onCreateInputView() {
        keyboardContainer = new LinearLayout(this);
        keyboardContainer.setOrientation(LinearLayout.VERTICAL);
        keyboardContainer.setBackgroundColor(Color.parseColor("#0D0F14"));

        // Add ergonomic bottom padding to lift bottom row and reduce thumb strain
        float density = getResources().getDisplayMetrics().density;
        int bottomPadding = (int) (28 * density);
        keyboardContainer.setPadding(2, 6, 2, bottomPadding);

        // Increase height to 50% of screen height
        int height = (int) (getResources().getDisplayMetrics().heightPixels * 0.50f);
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
            renderMainKeyboard();
        }
    }

    private void renderMainKeyboard() {
        // Top Row: Numbers (1 2 3 4 5 6 7 8 9 0)
        String[] rowNumbers = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"};
        keyboardContainer.addView(createRowLayout(rowNumbers, false));

        // Row 2: qwertyuiop (lowercase by default, hold to capitalize)
        String[] row1 = {"q", "w", "e", "r", "t", "y", "u", "i", "o", "p"};
        keyboardContainer.addView(createRowLayout(row1, true));

        // Row 3: asdfghjkl (9 letters)
        boolean showUpper = isShifted || isCapsLock;
        String[] row2Letters = {"a", "s", "d", "f", "g", "h", "j", "k", "l"};
        LinearLayout row2Layout = new LinearLayout(this);
        row2Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row2Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row2Params.setMargins(0, 1, 0, 1);
        row2Layout.setLayoutParams(row2Params);

        for (String letter : row2Letters) {
            final String l = letter;
            Button btn = createKeyButton(showUpper ? l.toUpperCase() : l.toLowerCase(), false);
            btn.setOnClickListener(v -> handleLetterPress(l));
            row2Layout.addView(btn);
        }
        keyboardContainer.addView(row2Layout);

        // Row 4: ⇧ Shift key, z x c v b n m, ⌫ Backspace
        LinearLayout row3Layout = new LinearLayout(this);
        row3Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row3Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row3Params.setMargins(0, 1, 0, 1);
        row3Layout.setLayoutParams(row3Params);

        // Shift Key
        Button shiftBtn = createKeyButton("⇧", true);
        if (showUpper) {
            shiftBtn.setBackgroundColor(Color.parseColor("#1C2433"));
            shiftBtn.setTextColor(Color.parseColor("#38BDF8"));
        }
        shiftBtn.setOnClickListener(v -> {
            long now = System.currentTimeMillis();
            boolean isDoubleTap = (now - lastShiftTapTime) < 320;
            lastShiftTapTime = now;

            if (isDoubleTap) {
                isCapsLock = !isCapsLock;
                isShifted = isCapsLock;
            } else {
                if (isCapsLock) {
                    isCapsLock = false;
                    isShifted = false;
                } else {
                    isShifted = !isShifted;
                }
            }
            renderKeyboard();
        });
        row3Layout.addView(shiftBtn);

        // z x c v b n m
        String[] row3Letters = {"z", "x", "c", "v", "b", "n", "m"};
        for (String item : row3Letters) {
            final String it = item;
            Button btn = createKeyButton(showUpper ? it.toUpperCase() : it.toLowerCase(), false);
            btn.setOnClickListener(v -> handleLetterPress(it));
            row3Layout.addView(btn);
        }

        // Backspace key at the end of Row 4
        Button backspaceBtn = createKeyButton("⌫", true);
        LinearLayout.LayoutParams bsParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.3f);
        bsParams.setMargins(1, 0, 1, 0);
        backspaceBtn.setLayoutParams(bsParams);
        backspaceBtn.setOnClickListener(v -> deleteChar());
        row3Layout.addView(backspaceBtn);
        keyboardContainer.addView(row3Layout);

        // Row 5: Infinity Key, comma (hold for ?), spacebar, period (hold for !), Enter key
        LinearLayout row4Layout = new LinearLayout(this);
        row4Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row4Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.15f);
        row4Params.setMargins(0, 1, 0, 1);
        row4Layout.setLayoutParams(row4Params);

        // Clean Infinity Key (NO 123)
        Button infinityBtn = createKeyButton("∞", true);
        infinityBtn.setTextColor(Color.parseColor("#C084FC"));
        LinearLayout.LayoutParams infParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        infParams.setMargins(1, 0, 1, 0);
        infinityBtn.setLayoutParams(infParams);
        infinityBtn.setTextSize(24);
        infinityBtn.setOnClickListener(v -> {
            isSymbols = true;
            renderKeyboard();
        });
        row4Layout.addView(infinityBtn);

        // Comma (hold for ?)
        Button commaBtn = createKeyButton(",", false);
        LinearLayout.LayoutParams commaP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        commaP.setMargins(1, 0, 1, 0);
        commaBtn.setLayoutParams(commaP);
        commaBtn.setOnClickListener(v -> commitText(","));
        commaBtn.setOnLongClickListener(v -> {
            commitText("?");
            return true;
        });
        row4Layout.addView(commaBtn);

        // Spacebar
        Button spaceBtn = createKeyButton("", false);
        LinearLayout.LayoutParams spaceP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 5.4f);
        spaceP.setMargins(1, 0, 1, 0);
        spaceBtn.setLayoutParams(spaceP);
        spaceBtn.setOnClickListener(v -> commitText(" "));
        row4Layout.addView(spaceBtn);

        // Period (hold for !)
        Button periodBtn = createKeyButton(".", false);
        LinearLayout.LayoutParams periodP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        periodP.setMargins(1, 0, 1, 0);
        periodBtn.setLayoutParams(periodP);
        periodBtn.setOnClickListener(v -> commitText("."));
        periodBtn.setOnLongClickListener(v -> {
            commitText("!");
            return true;
        });
        row4Layout.addView(periodBtn);

        // Enter
        Button enterBtn = createKeyButton("↵", true);
        enterBtn.setTextColor(Color.parseColor("#38BDF8"));
        enterBtn.setBackgroundColor(Color.parseColor("#141824"));
        LinearLayout.LayoutParams enterP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.5f);
        enterP.setMargins(1, 0, 1, 0);
        enterBtn.setLayoutParams(enterP);
        enterBtn.setOnClickListener(v -> sendKeyChar('\n'));
        row4Layout.addView(enterBtn);

        keyboardContainer.addView(row4Layout);
    }

    private void renderSymbols() {
        // Row 1: Numbers (1 2 3 4 5 6 7 8 9 0) moved to symbol keyboard
        String[] row1Numbers = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"};
        keyboardContainer.addView(createRowLayout(row1Numbers, false));

        // Row 2: tab key > / : " ~ ' ; \ <
        String[] row2Syms = {">", "/", ":", "\"", "~", "'", ";", "\\", "<"};
        LinearLayout row2Layout = new LinearLayout(this);
        row2Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row2P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row2P.setMargins(0, 1, 0, 1);
        row2Layout.setLayoutParams(row2P);

        Button tabBtn = createKeyButton("Tab", true);
        LinearLayout.LayoutParams tabP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        tabP.setMargins(1, 0, 1, 0);
        tabBtn.setLayoutParams(tabP);
        tabBtn.setTextSize(13);
        tabBtn.setOnClickListener(v -> commitText("    "));
        row2Layout.addView(tabBtn);

        for (String s : row2Syms) {
            Button btn = createKeyButton(s, false);
            btn.setOnClickListener(v -> commitText(s));
            row2Layout.addView(btn);
        }
        keyboardContainer.addView(row2Layout);

        // Row 3: * @ [ ♥ = ∞ ] ★ & followed by backspace
        String[] row3Syms = {"*", "@", "[", "♥", "=", "∞", "]", "★", "&"};
        LinearLayout row3Layout = new LinearLayout(this);
        row3Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row3P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row3P.setMargins(0, 1, 0, 1);
        row3Layout.setLayoutParams(row3P);

        for (String s : row3Syms) {
            Button btn = createKeyButton(s, false);
            if (s.equals("♥")) btn.setTextColor(Color.parseColor("#F43F5E"));
            if (s.equals("★")) btn.setTextColor(Color.parseColor("#FBBF24"));
            if (s.equals("∞")) btn.setTextColor(Color.parseColor("#38BDF8"));
            btn.setOnClickListener(v -> commitText(s));
            row3Layout.addView(btn);
        }

        Button backspaceBtn = createKeyButton("⌫", true);
        LinearLayout.LayoutParams bsP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        bsP.setMargins(1, 0, 1, 0);
        backspaceBtn.setLayoutParams(bsP);
        backspaceBtn.setOnClickListener(v -> deleteChar());
        row3Layout.addView(backspaceBtn);
        keyboardContainer.addView(row3Layout);

        // Row 4: $ ( + - # ÷ x ) %
        String[] row4Syms = {"$", "(", "+", "-", "#", "÷", "x", ")", "%"};
        LinearLayout row4Layout = new LinearLayout(this);
        row4Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row4P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row4P.setMargins(0, 1, 0, 1);
        row4Layout.setLayoutParams(row4P);
        row4Layout.setPadding(24, 0, 24, 0);

        for (String s : row4Syms) {
            Button btn = createKeyButton(s, false);
            btn.setOnClickListener(v -> commitText(s));
            row4Layout.addView(btn);
        }
        keyboardContainer.addView(row4Layout);

        // Row 5: ABC key, Comma, Space, Period, Enter
        LinearLayout row5Layout = new LinearLayout(this);
        row5Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row5P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.15f);
        row5P.setMargins(0, 1, 0, 1);
        row5Layout.setLayoutParams(row5P);

        Button abcBtn = createKeyButton("ABC", true);
        abcBtn.setTextColor(Color.parseColor("#38BDF8"));
        LinearLayout.LayoutParams abcP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        abcP.setMargins(1, 0, 1, 0);
        abcBtn.setLayoutParams(abcP);
        abcBtn.setTextSize(14);
        abcBtn.setOnClickListener(v -> {
            isSymbols = false;
            renderKeyboard();
        });
        row5Layout.addView(abcBtn);

        Button commaBtn = createKeyButton(",", false);
        LinearLayout.LayoutParams commaP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        commaP.setMargins(1, 0, 1, 0);
        commaBtn.setLayoutParams(commaP);
        commaBtn.setOnClickListener(v -> commitText(","));
        row5Layout.addView(commaBtn);

        Button spaceBtn = createKeyButton("", false);
        LinearLayout.LayoutParams spaceP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 5.4f);
        spaceP.setMargins(1, 0, 1, 0);
        spaceBtn.setLayoutParams(spaceP);
        spaceBtn.setOnClickListener(v -> commitText(" "));
        row5Layout.addView(spaceBtn);

        Button periodBtn = createKeyButton(".", false);
        LinearLayout.LayoutParams periodP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        periodP.setMargins(1, 0, 1, 0);
        periodBtn.setLayoutParams(periodP);
        periodBtn.setOnClickListener(v -> commitText("."));
        row5Layout.addView(periodBtn);

        Button enterBtn = createKeyButton("↵", true);
        enterBtn.setTextColor(Color.parseColor("#38BDF8"));
        enterBtn.setBackgroundColor(Color.parseColor("#141824"));
        LinearLayout.LayoutParams enterP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.5f);
        enterP.setMargins(1, 0, 1, 0);
        enterBtn.setLayoutParams(enterP);
        enterBtn.setOnClickListener(v -> sendKeyChar('\n'));
        row5Layout.addView(enterBtn);

        keyboardContainer.addView(row5Layout);
    }

    private LinearLayout createRowLayout(String[] keys, boolean isAlpha) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        params.setMargins(0, 1, 0, 1);
        row.setLayoutParams(params);

        boolean showUpper = isAlpha && (isShifted || isCapsLock);
        for (String k : keys) {
            final String text = k;
            String display = isAlpha ? (showUpper ? text.toUpperCase() : text.toLowerCase()) : text;
            Button btn = createKeyButton(display, false);
            btn.setOnClickListener(v -> {
                if (isAlpha) handleLetterPress(text);
                else commitText(text);
            });
            row.addView(btn);
        }
        return row;
    }

    private void handleLetterPress(String letter) {
        boolean shouldUpper = isShifted || isCapsLock;
        commitText(shouldUpper ? letter.toUpperCase() : letter.toLowerCase());
        if (isShifted && !isCapsLock) {
            isShifted = false;
            renderKeyboard();
        }
    }

    private Button createKeyButton(String text, boolean isSpecial) {
        Button btn = new Button(this);
        btn.setAllCaps(false);
        btn.setTransformationMethod(null);
        btn.setText(text);
        btn.setTextColor(Color.WHITE);
        btn.setTextSize(20);
        btn.setTypeface(Typeface.DEFAULT_BOLD);
        btn.setBackgroundColor(isSpecial ? Color.parseColor("#15171D") : Color.parseColor("#20222A"));
        btn.setPadding(0, 0, 0, 0);

        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.0f);
        p.setMargins(1, 0, 1, 0);
        btn.setLayoutParams(p);
        return btn;
    }

    private void commitText(String text) {
        InputConnection ic = getCurrentInputConnection();
        if (ic != null) {
            if (" ".equals(text) || ".".equals(text) || ",".equals(text) || "?".equals(text) || "!".equals(text) || "\n".equals(text)) {
                performAutocorrect(ic);
            }
            ic.commitText(text, 1);
        }
    }

    private void performAutocorrect(InputConnection ic) {
        CharSequence before = ic.getTextBeforeCursor(40, 0);
        if (before == null || before.length() == 0) return;

        int end = before.length();
        int start = end;
        while (start > 0 && Character.isLetterOrDigit(before.charAt(start - 1))) {
            start--;
        }
        if (start >= end) return;

        String rawWord = before.subSequence(start, end).toString();
        String lower = rawWord.toLowerCase();
        String replacement = AUTOCORRECT_MAP.get(lower);

        if (replacement != null && !replacement.equalsIgnoreCase(rawWord)) {
            // Preserve capitalization
            if (rawWord.equals(rawWord.toUpperCase()) && rawWord.length() > 1) {
                replacement = replacement.toUpperCase();
            } else if (Character.isUpperCase(rawWord.charAt(0))) {
                replacement = Character.toUpperCase(replacement.charAt(0)) + replacement.substring(1);
            }
            ic.deleteSurroundingText(rawWord.length(), 0);
            ic.commitText(replacement, 1);
        }
    }

    private void deleteChar() {
        InputConnection ic = getCurrentInputConnection();
        if (ic != null) {
            // Delete highlighted/selected text if any
            CharSequence selected = ic.getSelectedText(0);
            if (selected != null && selected.length() > 0) {
                ic.commitText("", 1);
            } else {
                ic.deleteSurroundingText(1, 0);
            }
        }
    }
}
