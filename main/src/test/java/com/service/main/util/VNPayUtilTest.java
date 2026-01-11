package com.service.main.util;

import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test cases để verify fix cho VNPay signature bug
 */
class VNPayUtilTest {

    @Test
    void testHashAllFields_NoTrailingAmpersand() {
        // Arrange
        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_Amount", "10000000");
        fields.put("vnp_Command", "pay");
        fields.put("vnp_TmnCode", "V0E40BL9");

        // Act
        String result = VNPayUtil.hashAllFields(fields);

        // Assert
        assertFalse(result.endsWith("&"), "Hash data should NOT end with &");
        assertTrue(result.contains("&"), "Hash data should contain & between fields");
        
        // Verify format: field=value&field=value
        String[] parts = result.split("&");
        for (String part : parts) {
            assertTrue(part.contains("="), "Each part should be field=value");
        }
    }

    @Test
    void testHashAllFields_WithEmptyValues() {
        // Arrange
        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_Amount", "10000000");
        fields.put("vnp_BankCode", "");  // Empty value
        fields.put("vnp_Command", "pay");
        fields.put("vnp_OrderInfo", "");  // Empty value

        // Act
        String result = VNPayUtil.hashAllFields(fields);

        // Assert
        assertFalse(result.contains("vnp_BankCode"), "Empty fields should be excluded");
        assertFalse(result.contains("vnp_OrderInfo"), "Empty fields should be excluded");
        assertFalse(result.endsWith("&"), "Should not end with &");
        assertFalse(result.contains("&&"), "Should not have double &&");
    }

    @Test
    void testHashAllFields_SingleField() {
        // Arrange
        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_Amount", "10000000");

        // Act
        String result = VNPayUtil.hashAllFields(fields);

        // Assert
        assertEquals("vnp_Amount=10000000", result);
        assertFalse(result.contains("&"), "Single field should not have &");
    }

    @Test
    void testHashAllFields_AlphabeticalOrder() {
        // Arrange
        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_TxnRef", "ORDER_1");
        fields.put("vnp_Amount", "10000000");
        fields.put("vnp_Command", "pay");

        // Act
        String result = VNPayUtil.hashAllFields(fields);

        // Assert - Should be sorted alphabetically
        assertTrue(result.startsWith("vnp_Amount="));
        assertTrue(result.contains("vnp_Command="));
        assertTrue(result.endsWith("vnp_TxnRef=ORDER_1"));
        
        // Verify order
        int amountPos = result.indexOf("vnp_Amount");
        int commandPos = result.indexOf("vnp_Command");
        int txnRefPos = result.indexOf("vnp_TxnRef");
        
        assertTrue(amountPos < commandPos);
        assertTrue(commandPos < txnRefPos);
    }

    @Test
    void testHashAllFields_EmptyMap() {
        // Arrange
        Map<String, String> fields = new HashMap<>();

        // Act
        String result = VNPayUtil.hashAllFields(fields);

        // Assert
        assertEquals("", result, "Empty map should return empty string");
    }

    @Test
    void testHashAllFields_NullValues() {
        // Arrange
        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_Amount", "10000000");
        fields.put("vnp_BankCode", null);  // Null value
        fields.put("vnp_Command", "pay");

        // Act
        String result = VNPayUtil.hashAllFields(fields);

        // Assert
        assertFalse(result.contains("vnp_BankCode"), "Null fields should be excluded");
        assertFalse(result.endsWith("&"), "Should not end with &");
        assertEquals(2, result.split("&").length, "Should only have 2 fields");
    }

    @Test
    void testHmacSHA512_ValidInput() {
        // Arrange
        String key = "SECRETKEY123";
        String data = "vnp_Amount=10000000&vnp_Command=pay";

        // Act
        String result = VNPayUtil.hmacSHA512(key, data);

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(128, result.length(), "SHA512 hash should be 128 hex characters");
        assertTrue(result.matches("[0-9a-f]{128}"), "Should be lowercase hex");
    }

    @Test
    void testHmacSHA512_Consistency() {
        // Arrange
        String key = "SECRETKEY123";
        String data = "vnp_Amount=10000000&vnp_Command=pay";

        // Act - Call twice
        String result1 = VNPayUtil.hmacSHA512(key, data);
        String result2 = VNPayUtil.hmacSHA512(key, data);

        // Assert - Should be identical
        assertEquals(result1, result2, "Same input should produce same hash");
    }

    @Test
    void testHmacSHA512_DifferentData() {
        // Arrange
        String key = "SECRETKEY123";
        String data1 = "vnp_Amount=10000000&vnp_Command=pay";
        String data2 = "vnp_Amount=10000000&vnp_Command=pay&";  // With trailing &

        // Act
        String result1 = VNPayUtil.hmacSHA512(key, data1);
        String result2 = VNPayUtil.hmacSHA512(key, data2);

        // Assert - Should be different!
        assertNotEquals(result1, result2, "Different data should produce different hash");
    }

    @Test
    void testGetIpAddress_WithXForwardedFor() {
        // This would require mocking HttpServletRequest
        // Left as placeholder for integration test
    }

    @Test
    void testGetRandomNumber() {
        // Arrange
        int length = 10;

        // Act
        String result = VNPayUtil.getRandomNumber(length);

        // Assert
        assertEquals(length, result.length());
        assertTrue(result.matches("\\d+"), "Should only contain digits");
    }

    /**
     * Integration test - Verify the exact scenario that caused the bug
     */
    @Test
    void testRealWorldScenario_PaymentVerification() {
        // Arrange - Simulate VNPay callback params
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "10000000");
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_Command", "pay");
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_OrderInfo", "Thanh toan don hang: 1");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TmnCode", "V0E40BL9");
        params.put("vnp_TransactionNo", "14234567");
        params.put("vnp_TxnRef", "ORDER_1_1234567890");

        // Remove hash fields (như trong verifyPayment)
        Map<String, String> hashParams = new HashMap<>(params);
        hashParams.remove("vnp_SecureHash");
        hashParams.remove("vnp_SecureHashType");

        // Act
        String hashData = VNPayUtil.hashAllFields(hashParams);
        String calculatedHash = VNPayUtil.hmacSHA512("GV6VZ76F2TQ98CFKQ1OZKPGDDPINF792", hashData);

        // Assert
        assertFalse(hashData.endsWith("&"), "Hash data must not end with &");
        assertNotNull(calculatedHash);
        assertEquals(128, calculatedHash.length());
        
        // Verify all fields are included
        assertTrue(hashData.contains("vnp_Amount=10000000"));
        assertTrue(hashData.contains("vnp_BankCode=NCB"));
        assertTrue(hashData.contains("vnp_Command=pay"));
        
        // Verify format
        assertFalse(hashData.contains("&&"));
        assertFalse(hashData.startsWith("&"));
        assertFalse(hashData.endsWith("&"));
    }

    /**
     * Test case để verify fix cho bug cụ thể
     */
    @Test
    void testBugFix_NoTrailingAmpersandWithEmptyField() {
        // Arrange - Scenario gây ra bug: có field empty ở giữa
        Map<String, String> fields = new HashMap<>();
        fields.put("field_A", "value1");
        fields.put("field_B", "");        // Empty field
        fields.put("field_C", "value3");

        // Act
        String result = VNPayUtil.hashAllFields(fields);

        // Assert
        assertEquals("field_A=value1&field_C=value3", result);
        assertFalse(result.endsWith("&"), "CRITICAL: Must not end with &");
        assertFalse(result.contains("field_B"), "Empty field should be excluded");
    }
}
