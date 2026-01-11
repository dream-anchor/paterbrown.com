import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting batch QR code extraction...');

    // 1. Find all PDF attachments linked to train bookings without QR codes
    const { data: attachments, error: fetchError } = await supabase
      .from('travel_attachments')
      .select(`
        id,
        file_name,
        booking_id,
        travel_bookings!inner(booking_type)
      `)
      .like('file_name', '%.pdf')
      .is('qr_code_image_path', null)
      .not('booking_id', 'is', null);

    if (fetchError) {
      console.error('Error fetching attachments:', fetchError);
      throw fetchError;
    }

    // Filter for train bookings only
    const trainAttachments = attachments?.filter(
      (att: any) => att.travel_bookings?.booking_type === 'train'
    ) || [];

    console.log(`Found ${trainAttachments.length} train ticket PDFs without QR codes`);

    if (trainAttachments.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No train ticket PDFs without QR codes found',
        processed: 0,
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Process each attachment sequentially (to avoid rate limits)
    const results: Array<{
      attachment_id: string;
      file_name: string;
      booking_id: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const att of trainAttachments) {
      console.log(`Processing: ${att.file_name} (${att.id})`);
      
      try {
        const response = await supabase.functions.invoke('extract-ticket-qr', {
          body: { 
            attachment_id: att.id,
            booking_id: att.booking_id
          }
        });

        if (response.error) {
          console.error(`Error extracting QR for ${att.id}:`, response.error);
          results.push({
            attachment_id: att.id,
            file_name: att.file_name,
            booking_id: att.booking_id,
            success: false,
            error: response.error.message || 'Unknown error'
          });
        } else {
          console.log(`Successfully extracted QR for ${att.file_name}`);
          results.push({
            attachment_id: att.id,
            file_name: att.file_name,
            booking_id: att.booking_id,
            success: true
          });
        }

        // Small delay between requests to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (err) {
        console.error(`Exception processing ${att.id}:`, err);
        results.push({
          attachment_id: att.id,
          file_name: att.file_name,
          booking_id: att.booking_id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Batch extraction complete: ${successCount} success, ${failCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${results.length} train ticket PDFs`,
      processed: results.length,
      successful: successCount,
      failed: failCount,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Batch extraction error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
