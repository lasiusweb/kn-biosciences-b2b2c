import { NextRequest, NextResponse } from 'next/server';
import { delhiveryClient } from '@/lib/shipping/delhivery';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pincode = searchParams.get('pincode');

  if (!pincode || pincode.length !== 6) {
    return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
  }

  try {
    const rate = await delhiveryClient.calculateRate(pincode, 1000); // Check with 1kg as default for serviceability
    
    if (rate && rate.is_serviceable) {
      // Calculate EDD (approx 5 days from now)
      const edd = new Date();
      edd.setDate(edd.getDate() + (rate.estimated_delivery_days || 5));

      return NextResponse.json({
        serviceable: true,
        edd: edd.toISOString(),
        description: rate.description,
      });
    }

    return NextResponse.json({
      serviceable: false,
      message: 'Not serviceable by standard courier.',
    });
  } catch (error) {
    console.error('Serviceability API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
