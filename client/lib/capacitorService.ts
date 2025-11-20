import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export class CapacitorService {
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  // Camera functionality for QR scanning
  static async takePicture(): Promise<string | null> {
    try {
      if (!this.isNative()) {
        console.log('Camera not available in web mode');
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  }

  // Geolocation for maps
  static async getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
    try {
      if (!this.isNative()) {
        // Fallback to web geolocation
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.error('Web geolocation error:', error);
              resolve(null);
            }
          );
        });
      }

      const coordinates = await Geolocation.getCurrentPosition();
      return {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // Push notifications
  static async requestNotificationPermissions(): Promise<boolean> {
    try {
      if (!this.isNative()) {
        console.log('Push notifications not available in web mode');
        return false;
      }

      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async registerForPushNotifications(): Promise<void> {
    try {
      if (!this.isNative()) return;

      await PushNotifications.register();
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  // Local notifications
  static async scheduleLocalNotification(title: string, body: string, delay: number = 0): Promise<void> {
    try {
      if (!this.isNative()) {
        console.log('Local notifications not available in web mode');
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: delay > 0 ? { at: new Date(Date.now() + delay) } : undefined,
          },
        ],
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Storage
  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isNative()) {
        await Preferences.set({ key, value });
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item:', error);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      if (this.isNative()) {
        const result = await Preferences.get({ key });
        return result.value;
      } else {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      if (this.isNative()) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  // App lifecycle
  static async initializeApp(): Promise<void> {
    if (!this.isNative()) return;

    try {
      // Request permissions
      await this.requestNotificationPermissions();
      
      // Register for push notifications
      await this.registerForPushNotifications();

      console.log('Capacitor app initialized successfully');
    } catch (error) {
      console.error('Error initializing Capacitor app:', error);
    }
  }
}
