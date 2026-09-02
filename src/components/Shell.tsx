"use client";

import { useIsPhone } from "@/lib/desktop/use-device";
import { Desktop } from "@/components/desktop/Desktop";
import { Phone } from "@/components/phone/Phone";

export function Shell() {
  const isPhone = useIsPhone();
  return isPhone ? <Phone /> : <Desktop />;
}
