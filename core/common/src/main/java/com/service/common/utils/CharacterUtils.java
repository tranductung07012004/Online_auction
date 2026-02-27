package com.service.common.utils;

public class CharacterUtils {
    private CharacterUtils() {
        throw new UnsupportedOperationException("characterUtils cannot be instantiated");
    }

    public static String maskFullname(String fullname) {
        if (fullname == null || fullname.trim().isEmpty()) {
            return fullname;
        }

        String trimmed = fullname.trim();
        String[] nameParts = trimmed.split("\\s+");

        if (nameParts.length == 0) {
            return trimmed;
        }

        StringBuilder masked = new StringBuilder();

        for (int i = 0; i < nameParts.length - 1; i++) {
            if (i > 0) {
                masked.append(" ");
            }
            masked.append("*".repeat(nameParts[i].length()));
        }

        String lastName = nameParts[nameParts.length - 1];
        if (lastName.length() == 1) {
            if (masked.length() > 0) {
                masked.append(" ");
            }
            masked.append(lastName);
        } else {
            if (masked.length() > 0) {
                masked.append(" ");
            }
            masked.append(maskLastName(lastName));
        }

        return masked.toString();
    }

    public static String maskLastName(String lastName) {
        if (lastName == null || lastName.length() <= 1) {
            return lastName;
        }

        int length = lastName.length();
        if (length == 2) {
            return lastName.charAt(0) + "*";
        } else {
            StringBuilder masked = new StringBuilder();
            masked.append(lastName.charAt(0));
            for (int i = 1; i < length - 1; i++) {
                masked.append("*");
            }
            masked.append(lastName.charAt(length - 1));
            return masked.toString();
        }
    }
}
