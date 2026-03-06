import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isVertexAIEnabled, isCloudStorageEnabled, isFirebaseEnabled, isBigQueryEnabled, isSpeechToTextEnabled, isTranslateAPIEnabled, isGoogleMapsEnabled, isCloudFunctionsEnabled } from '@/lib/featureFlags';

describe('Feature Flags', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        // Clear all relevant env vars
        delete process.env.GCP_PROJECT_ID;
        delete process.env.GOOGLE_PROJECT_ID;
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        delete process.env.GCP_CLIENT_EMAIL;
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        delete process.env.GCS_BUCKET_NAME;
        delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        delete process.env.BIGQUERY_DATASET;
        delete process.env.GOOGLE_TRANSLATE_API_KEY;
        delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        delete process.env.CLOUD_FUNCTION_PRODUCT_PIPELINE_URL;
        delete process.env.AI_LISTING_FUNCTION_URL;
        delete process.env.CLOUD_FUNCTION_ORDER_NOTIFICATION_URL;
        delete process.env.ORDER_NOTIFY_FUNCTION_URL;
    });

    describe('isVertexAIEnabled', () => {
        it('should return false when no GCP env vars are set', () => {
            expect(isVertexAIEnabled()).toBe(false);
        });

        it('should return true when GCP project ID and credentials are set', () => {
            process.env.GCP_PROJECT_ID = 'test-project';
            process.env.GCP_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';
            expect(isVertexAIEnabled()).toBe(true);
        });

        it('should return true with JSON credentials blob', () => {
            process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = '{"project_id":"test"}';
            expect(isVertexAIEnabled()).toBe(true);
        });
    });

    describe('isCloudStorageEnabled', () => {
        it('should return false without bucket name', () => {
            process.env.GCP_PROJECT_ID = 'test-project';
            expect(isCloudStorageEnabled()).toBe(false);
        });

        it('should return true with bucket name and project ID', () => {
            process.env.GCS_BUCKET_NAME = 'test-bucket';
            process.env.GCP_PROJECT_ID = 'test-project';
            expect(isCloudStorageEnabled()).toBe(true);
        });
    });

    describe('isFirebaseEnabled', () => {
        it('should return false without Firebase config', () => {
            expect(isFirebaseEnabled()).toBe(false);
        });

        it('should return true with Firebase config', () => {
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key';
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
            expect(isFirebaseEnabled()).toBe(true);
        });
    });

    describe('isBigQueryEnabled', () => {
        it('should return false without dataset', () => {
            process.env.GCP_PROJECT_ID = 'test-project';
            expect(isBigQueryEnabled()).toBe(false);
        });

        it('should return true with project ID and dataset', () => {
            process.env.GCP_PROJECT_ID = 'test-project';
            process.env.BIGQUERY_DATASET = 'test-dataset';
            expect(isBigQueryEnabled()).toBe(true);
        });
    });

    describe('isTranslateAPIEnabled', () => {
        it('should return false without any translate config', () => {
            expect(isTranslateAPIEnabled()).toBe(false);
        });

        it('should return true with translate API key', () => {
            process.env.GOOGLE_TRANSLATE_API_KEY = 'test-key';
            expect(isTranslateAPIEnabled()).toBe(true);
        });
    });

    describe('isGoogleMapsEnabled', () => {
        it('should return false without Maps API key', () => {
            expect(isGoogleMapsEnabled()).toBe(false);
        });

        it('should return true with Maps API key', () => {
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-key';
            expect(isGoogleMapsEnabled()).toBe(true);
        });
    });

    describe('isCloudFunctionsEnabled', () => {
        it('should return false without function URLs', () => {
            expect(isCloudFunctionsEnabled()).toBe(false);
        });

        it('should return true with product pipeline URL', () => {
            process.env.CLOUD_FUNCTION_PRODUCT_PIPELINE_URL = 'https://fn.test.com';
            expect(isCloudFunctionsEnabled()).toBe(true);
        });

        it('should return true with alternative naming convention', () => {
            process.env.AI_LISTING_FUNCTION_URL = 'https://fn.test.com';
            expect(isCloudFunctionsEnabled()).toBe(true);
        });
    });
});
