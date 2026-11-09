package com.infinityboard.keyboard;

import android.content.Context;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.StateListDrawable;
import android.inputmethodservice.InputMethodService;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputConnection;
import android.widget.FrameLayout;
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
        AUTOCORRECT_MAP.put("youre", "you're");
        AUTOCORRECT_MAP.put("theyre", "they're");
        AUTOCORRECT_MAP.put("thats", "that's");
    }

    @Override
    public View onCreateInputView() {
        keyboardContainer = new LinearLayout(this);
        keyboardContainer.setOrientation(LinearLayout.VERTICAL);
        keyboardContainer.setBackgroundColor(Color.parseColor("#0A0C10"));

        // Ergonomic bottom padding to lift bottom row and reduce thumb strain
        float density = getResources().getDisplayMetrics().density;
        int bottomPadding = (int) (28 * density);
        keyboardContainer.setPadding((int) (2 * density), (int) (6 * density), (int) (2 * density), bottomPadding);

        // 50% of screen height
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
        float density = getResources().getDisplayMetrics().density;

        // Top Row: Numbers (1 2 3 4 5 6 7 8 9 0)
        String[] rowNumbers = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"};
        keyboardContainer.addView(createRowLayout(rowNumbers, false));

        // Row 2: qwertyuiop (lowercase by default, hold/shift to capitalize)
        String[] row1 = {"q", "w", "e", "r", "t", "y", "u", "i", "o", "p"};
        keyboardContainer.addView(createRowLayout(row1, true));

        // Row 3: asdfghjkl (9 letters)
        boolean showUpper = isShifted || isCapsLock;
        String[] row2Letters = {"a", "s", "d", "f", "g", "h", "j", "k", "l"};
        LinearLayout row2Layout = new LinearLayout(this);
        row2Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row2Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row2Params.setMargins(0, (int) (1 * density), 0, (int) (1 * density));
        row2Layout.setLayoutParams(row2Params);
        int sidePadding = (int) (12 * density);
        row2Layout.setPadding(sidePadding, 0, sidePadding, 0);

        for (String letter : row2Letters) {
            final String l = letter;
            FrameLayout keyView = createKeyView(showUpper ? l.toUpperCase() : l.toLowerCase(), null, false, 1.0f);
            keyView.setOnClickListener(v -> handleLetterPress(l));
            row2Layout.addView(keyView);
        }
        keyboardContainer.addView(row2Layout);

        // Row 4: ⇧ Shift key, z x c v b n m, ⌫ Backspace
        LinearLayout row3Layout = new LinearLayout(this);
        row3Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row3Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row3Params.setMargins(0, (int) (1 * density), 0, (int) (1 * density));
        row3Layout.setLayoutParams(row3Params);

        // Shift Key
        FrameLayout shiftKey = createKeyView("⇧", isCapsLock ? "CAPS" : null, true, 1.35f);
        TextView shiftTv = getMainTextView(shiftKey);
        if (showUpper) {
            int strokeWidth = (int) (1.5f * density);
            int cornerRadius = (int) (7 * density);
            GradientDrawable activeShift = new GradientDrawable();
            activeShift.setShape(GradientDrawable.RECTANGLE);
            activeShift.setCornerRadius(cornerRadius);
            activeShift.setColor(Color.parseColor("#1C2433"));
            activeShift.setStroke(strokeWidth, Color.parseColor("#38BDF8"));
            shiftKey.setBackground(activeShift);
            if (shiftTv != null) {
                shiftTv.setTextColor(Color.parseColor("#38BDF8"));
            }
        }
        shiftKey.setOnClickListener(v -> {
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
        row3Layout.addView(shiftKey);

        // z x c v b n m
        String[] row3Letters = {"z", "x", "c", "v", "b", "n", "m"};
        for (String item : row3Letters) {
            final String it = item;
            FrameLayout keyView = createKeyView(showUpper ? it.toUpperCase() : it.toLowerCase(), null, false, 1.0f);
            keyView.setOnClickListener(v -> handleLetterPress(it));
            row3Layout.addView(keyView);
        }

        // Backspace key at the end of Row 4
        FrameLayout backspaceKey = createKeyView("⌫", null, true, 1.35f);
        backspaceKey.setOnClickListener(v -> deleteChar());
        backspaceKey.setOnLongClickListener(v -> {
            for (int i = 0; i < 4; i++) {
                deleteChar();
            }
            return true;
        });
        row3Layout.addView(backspaceKey);
        keyboardContainer.addView(row3Layout);

        // Row 5: Infinity Key, comma (with small ?), spacebar, period (with small !), Enter key
        LinearLayout row4Layout = new LinearLayout(this);
        row4Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row4Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.15f);
        row4Params.setMargins(0, (int) (1 * density), 0, (int) (1 * density));
        row4Layout.setLayoutParams(row4Params);

        // Clean Infinity Key with gradient shader
        FrameLayout infinityKey = createKeyView("∞", null, true, 1.4f);
        TextView infTv = getMainTextView(infinityKey);
        if (infTv != null) {
            infTv.setTextSize(26);
            infTv.setTextColor(Color.parseColor("#C084FC"));
            infTv.addOnLayoutChangeListener((v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
                int w = right - left;
                if (w > 0) {
                    Shader textShader = new LinearGradient(0, 0, w, 0,
                        new int[]{Color.parseColor("#38BDF8"), Color.parseColor("#C084FC"), Color.parseColor("#F43F5E")},
                        null, Shader.TileMode.CLAMP);
                    infTv.getPaint().setShader(textShader);
                    infTv.invalidate();
                }
            });
        }
        infinityKey.setOnClickListener(v -> {
            isSymbols = true;
            renderKeyboard();
        });
        row4Layout.addView(infinityKey);

        // Comma key with small '?' in upper right corner, hold for '?'
        FrameLayout commaKey = createKeyView(",", "?", false, 1.1f);
        TextView commaTv = getMainTextView(commaKey);
        if (commaTv != null) commaTv.setTextSize(24);
        commaKey.setOnClickListener(v -> commitText(","));
        commaKey.setOnLongClickListener(v -> {
            commitText("?");
            v.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
            return true;
        });
        row4Layout.addView(commaKey);

        // Spacebar with subtle physical accent bar
        FrameLayout spaceKey = createKeyView("", null, false, 5.4f);
        View bar = new View(this);
        GradientDrawable barDraw = new GradientDrawable();
        barDraw.setShape(GradientDrawable.RECTANGLE);
        barDraw.setColor(Color.parseColor("#475267"));
        barDraw.setCornerRadius((int) (2 * density));
        bar.setBackground(barDraw);
        FrameLayout.LayoutParams barParams = new FrameLayout.LayoutParams(
            (int) (70 * density), (int) (3 * density));
        barParams.gravity = Gravity.CENTER;
        spaceKey.addView(bar);
        spaceKey.setOnClickListener(v -> commitText(" "));
        row4Layout.addView(spaceKey);

        // Period key with small '!' in upper right corner, hold for '!'
        FrameLayout periodKey = createKeyView(".", "!", false, 1.1f);
        TextView periodTv = getMainTextView(periodKey);
        if (periodTv != null) periodTv.setTextSize(24);
        periodKey.setOnClickListener(v -> commitText("."));
        periodKey.setOnLongClickListener(v -> {
            commitText("!");
            v.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
            return true;
        });
        row4Layout.addView(periodKey);

        // Enter Key
        FrameLayout enterKey = createKeyView("↵", null, true, 1.5f);
        TextView enterTv = getMainTextView(enterKey);
        if (enterTv != null) {
            enterTv.setTextColor(Color.parseColor("#38BDF8"));
        }
        int strokeWidth = (int) (1.5f * density);
        int cornerRadius = (int) (7 * density);
        GradientDrawable enterDraw = new GradientDrawable();
        enterDraw.setShape(GradientDrawable.RECTANGLE);
        enterDraw.setCornerRadius(cornerRadius);
        enterDraw.setColor(Color.parseColor("#121724"));
        enterDraw.setStroke(strokeWidth, Color.parseColor("#1E3654"));
        enterKey.setBackground(enterDraw);
        enterKey.setOnClickListener(v -> sendKeyChar('\n'));
        row4Layout.addView(enterKey);

        keyboardContainer.addView(row4Layout);
    }

    private void renderSymbols() {
        float density = getResources().getDisplayMetrics().density;

        // Row 1: Numbers (1 2 3 4 5 6 7 8 9 0)
        String[] row1Numbers = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"};
        keyboardContainer.addView(createRowLayout(row1Numbers, false));

        // Row 2: tab key > / : " ~ ' ; \ <
        String[] row2Syms = {">", "/", ":", "\"", "~", "'", ";", "\\", "<"};
        LinearLayout row2Layout = new LinearLayout(this);
        row2Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row2P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row2P.setMargins(0, (int) (1 * density), 0, (int) (1 * density));
        row2Layout.setLayoutParams(row2P);

        FrameLayout tabKey = createKeyView("Tab", null, true, 1.4f);
        TextView tabTv = getMainTextView(tabKey);
        if (tabTv != null) tabTv.setTextSize(13);
        tabKey.setOnClickListener(v -> commitText("    "));
        row2Layout.addView(tabKey);

        for (String s : row2Syms) {
            final String sym = s;
            FrameLayout keyView = createKeyView(sym, null, false, 1.0f);
            keyView.setOnClickListener(v -> commitText(sym));
            row2Layout.addView(keyView);
        }
        keyboardContainer.addView(row2Layout);

        // Row 3: * @ [ ♥ = ∞ ] ★ & followed by backspace
        String[] row3Syms = {"*", "@", "[", "♥", "=", "∞", "]", "★", "&"};
        LinearLayout row3Layout = new LinearLayout(this);
        row3Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row3P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row3P.setMargins(0, (int) (1 * density), 0, (int) (1 * density));
        row3Layout.setLayoutParams(row3P);

        for (String s : row3Syms) {
            final String sym = s;
            FrameLayout keyView = createKeyView(sym, null, false, 1.0f);
            TextView tv = getMainTextView(keyView);
            if (tv != null) {
                if (sym.equals("♥")) tv.setTextColor(Color.parseColor("#F43F5E"));
                if (sym.equals("★")) tv.setTextColor(Color.parseColor("#FBBF24"));
                if (sym.equals("∞")) tv.setTextColor(Color.parseColor("#38BDF8"));
            }
            keyView.setOnClickListener(v -> commitText(sym));
            row3Layout.addView(keyView);
        }

        FrameLayout backspaceKey = createKeyView("⌫", null, true, 1.4f);
        backspaceKey.setOnClickListener(v -> deleteChar());
        row3Layout.addView(backspaceKey);
        keyboardContainer.addView(row3Layout);

        // Row 4: $ ( + - # ÷ x ) %
        String[] row4Syms = {"$", "(", "+", "-", "#", "÷", "x", ")", "%"};
        LinearLayout row4Layout = new LinearLayout(this);
        row4Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row4P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row4P.setMargins(0, (int) (1 * density), 0, (int) (1 * density));
        row4Layout.setLayoutParams(row4P);
        int sidePad = (int) (12 * density);
        row4Layout.setPadding(sidePad, 0, sidePad, 0);

        for (String s : row4Syms) {
            final String sym = s;
            FrameLayout keyView = createKeyView(sym, null, false, 1.0f);
            keyView.setOnClickListener(v -> commitText(sym));
            row4Layout.addView(keyView);
        }
        keyboardContainer.addView(row4Layout);

        // Row 5: ABC key, Comma (with ?), Space, Period (with !), Enter
        LinearLayout row5Layout = new LinearLayout(this);
        row5Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row5P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.15f);
        row5P.setMargins(0, (int) (1 * density), 0, (int) (1 * density));
        row5Layout.setLayoutParams(row5P);

        FrameLayout abcKey = createKeyView("ABC", null, true, 1.4f);
        TextView abcTv = getMainTextView(abcKey);
        if (abcTv != null) {
            abcTv.setTextSize(14);
            abcTv.setTextColor(Color.parseColor("#38BDF8"));
        }
        abcKey.setOnClickListener(v -> {
            isSymbols = false;
            renderKeyboard();
        });
        row5Layout.addView(abcKey);

        FrameLayout commaKey = createKeyView(",", "?", false, 1.1f);
        TextView commaTv = getMainTextView(commaKey);
        if (commaTv != null) commaTv.setTextSize(24);
        commaKey.setOnClickListener(v -> commitText(","));
        commaKey.setOnLongClickListener(v -> {
            commitText("?");
            v.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
            return true;
        });
        row5Layout.addView(commaKey);

        FrameLayout spaceKey = createKeyView("", null, false, 5.4f);
        View bar = new View(this);
        GradientDrawable barDraw = new GradientDrawable();
        barDraw.setShape(GradientDrawable.RECTANGLE);
        barDraw.setColor(Color.parseColor("#475267"));
        barDraw.setCornerRadius((int) (2 * density));
        bar.setBackground(barDraw);
        FrameLayout.LayoutParams barParams = new FrameLayout.LayoutParams(
            (int) (70 * density), (int) (3 * density));
        barParams.gravity = Gravity.CENTER;
        spaceKey.addView(bar);
        spaceKey.setOnClickListener(v -> commitText(" "));
        row5Layout.addView(spaceKey);

        FrameLayout periodKey = createKeyView(".", "!", false, 1.1f);
        TextView periodTv = getMainTextView(periodKey);
        if (periodTv != null) periodTv.setTextSize(24);
        periodKey.setOnClickListener(v -> commitText("."));
        periodKey.setOnLongClickListener(v -> {
            commitText("!");
            v.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
            return true;
        });
        row5Layout.addView(periodKey);

        FrameLayout enterKey = createKeyView("↵", null, true, 1.5f);
        TextView enterTv = getMainTextView(enterKey);
        if (enterTv != null) {
            enterTv.setTextColor(Color.parseColor("#38BDF8"));
        }
        int strokeWidth = (int) (1.5f * density);
        int cornerRadius = (int) (7 * density);
        GradientDrawable enterDraw = new GradientDrawable();
        enterDraw.setShape(GradientDrawable.RECTANGLE);
        enterDraw.setCornerRadius(cornerRadius);
        enterDraw.setColor(Color.parseColor("#121724"));
        enterDraw.setStroke(strokeWidth, Color.parseColor("#1E3654"));
        enterKey.setBackground(enterDraw);
        enterKey.setOnClickListener(v -> sendKeyChar('\n'));
        row5Layout.addView(enterKey);

        keyboardContainer.addView(row5Layout);
    }

    private LinearLayout createRowLayout(String[] keys, boolean isAlpha) {
        float density = getResources().getDisplayMetrics().density;
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        params.setMargins(0, (int) (1 * density), 0, (int) (1 * density));
        row.setLayoutParams(params);

        boolean showUpper = isAlpha && (isShifted || isCapsLock);
        for (String k : keys) {
            final String text = k;
            String display = isAlpha ? (showUpper ? text.toUpperCase() : text.toLowerCase()) : text;
            FrameLayout keyView = createKeyView(display, null, false, 1.0f);
            keyView.setOnClickListener(v -> {
                if (isAlpha) handleLetterPress(text);
                else commitText(text);
            });
            row.addView(keyView);
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

    // Creates an authentic tactile keyboard key with outline within borders,
    // centered main text, optional small subtext (e.g. ? or !), and shrinking press depression
    private FrameLayout createKeyView(String mainText, String subText, boolean isSpecial, float weight) {
        float density = getResources().getDisplayMetrics().density;
        FrameLayout keyView = new FrameLayout(this);
        keyView.setClickable(true);
        keyView.setFocusable(true);
        keyView.setHapticFeedbackEnabled(true);

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, weight);
        int marginH = (int) (1.8f * density);
        int marginV = (int) (2.0f * density);
        lp.setMargins(marginH, marginV, marginH, marginV);
        keyView.setLayoutParams(lp);

        keyView.setBackground(createKeyDrawable(isSpecial, density));
        setupKeyDepressAnimation(keyView, density);

        // Centered main text
        if (mainText != null && !mainText.isEmpty()) {
            TextView mainTv = new TextView(this);
            mainTv.setText(mainText);
            mainTv.setTextColor(Color.WHITE);
            mainTv.setTextSize(20);
            mainTv.setTypeface(Typeface.DEFAULT_BOLD);
            mainTv.setGravity(Gravity.CENTER);

            FrameLayout.LayoutParams tvParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
            mainTv.setLayoutParams(tvParams);
            keyView.addView(mainTv);
        }

        // Small subtext (e.g. ? or ! in top right corner)
        if (subText != null && !subText.isEmpty()) {
            TextView subTv = new TextView(this);
            subTv.setText(subText);
            subTv.setTextColor(Color.parseColor("#38BDF8")); // Vibrant cyan/sky blue
            subTv.setTextSize(11);
            subTv.setTypeface(Typeface.DEFAULT_BOLD);

            FrameLayout.LayoutParams subParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            subParams.gravity = Gravity.TOP | Gravity.END;
            subParams.setMargins(0, (int) (3 * density), (int) (5 * density), 0);
            subTv.setLayoutParams(subParams);
            keyView.addView(subTv);
        }

        return keyView;
    }

    // Tactile keycap drawable with stroke outline and lighter grey on press
    private Drawable createKeyDrawable(boolean isSpecial, float density) {
        StateListDrawable sld = new StateListDrawable();
        int cornerRadius = (int) (7 * density);
        int strokeWidth = (int) (1.5f * density);

        // Pressed state: lighter grey, brighter outline
        GradientDrawable pressed = new GradientDrawable();
        pressed.setShape(GradientDrawable.RECTANGLE);
        pressed.setCornerRadius(cornerRadius);
        pressed.setColor(isSpecial ? Color.parseColor("#2B3142") : Color.parseColor("#3C4458"));
        pressed.setStroke(strokeWidth, isSpecial ? Color.parseColor("#4B5672") : Color.parseColor("#606E8E"));

        // Normal state: high contrast key with crisp outline within borders
        GradientDrawable normal = new GradientDrawable();
        normal.setShape(GradientDrawable.RECTANGLE);
        normal.setCornerRadius(cornerRadius);
        normal.setColor(isSpecial ? Color.parseColor("#151821") : Color.parseColor("#222530"));
        normal.setStroke(strokeWidth, isSpecial ? Color.parseColor("#2E3546") : Color.parseColor("#40495D"));

        sld.addState(new int[]{android.R.attr.state_pressed}, pressed);
        sld.addState(new int[]{}, normal);
        return sld;
    }

    // Smoothly shrinks the key view to 92% and depresses slightly on touch
    private void setupKeyDepressAnimation(View view, float density) {
        view.setOnTouchListener((v, event) -> {
            int action = event.getActionMasked();
            if (action == MotionEvent.ACTION_DOWN) {
                v.animate()
                    .scaleX(0.92f)
                    .scaleY(0.92f)
                    .translationY(1.5f * density)
                    .setDuration(45)
                    .start();
                v.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
            } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
                v.animate()
                    .scaleX(1.0f)
                    .scaleY(1.0f)
                    .translationY(0f)
                    .setDuration(70)
                    .start();
            }
            return false; // Return false so onClickListener and onLongClickListener continue to fire
        });
    }

    private TextView getMainTextView(FrameLayout keyView) {
        if (keyView == null || keyView.getChildCount() == 0) return null;
        for (int i = 0; i < keyView.getChildCount(); i++) {
            View child = keyView.getChildAt(i);
            if (child instanceof TextView) {
                return (TextView) child;
            }
        }
        return null;
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
