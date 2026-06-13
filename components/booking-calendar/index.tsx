// Switches between mobile and desktop calendar implementations based on viewport width.
// Uses CSS media queries to avoid hydration mismatch.

import DesktopBookingCalendar from "./desktop/DesktopBookingCalendar";
import MobileBookingCalendar from "./mobile/MobileBookingCalendar";

export default function BookingCalendar() {
	return (
		<>
			<div className="lg:hidden">
				<MobileBookingCalendar />
			</div>
			<div className="hidden lg:block">
				<DesktopBookingCalendar />
			</div>
		</>
	);
}
