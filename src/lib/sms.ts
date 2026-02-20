import { supabase } from '@/integrations/supabase/client';

export interface SMSMessage {
  userId: string;
  phoneNumber: string;
  message: string;
  messageType: 'food_order' | 'room_booking' | 'facility_booking';
  referenceId?: string;
}

export const sendSMSNotification = async (smsData: SMSMessage) => {
  try {
    // Log the SMS message to database
    const { error } = await supabase
      .from('sms_logs')
      .insert({
        user_id: smsData.userId,
        phone_number: smsData.phoneNumber,
        message: smsData.message,
        message_type: smsData.messageType,
        reference_id: smsData.referenceId,
        status: 'pending'
      });

    if (error) throw error;

    // TODO: When SMS service is added, send actual SMS here
    console.log('SMS logged:', smsData);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to log SMS:', error);
    return { success: false, error };
  }
};

export const createFoodOrderSMS = (customerName: string, orderDetails: string) => {
  return `Hi ${customerName}, your food order has been confirmed! ${orderDetails}. You'll be notified when it's ready. - TOPP Club House`;
};

export const createRoomBookingSMS = (guestName: string, roomName: string, checkIn: string, checkOut: string) => {
  return `Hi ${guestName}, your room booking is confirmed! ${roomName} from ${checkIn} to ${checkOut}. - TOPP Club House`;
};

export const createFacilityBookingSMS = (userName: string, facilityName: string, date: string, time: string) => {
  return `Hi ${userName}, your facility booking is confirmed! ${facilityName} on ${date} at ${time}. - TOPP Club House`;
};