
/**************************************************************
 * This file exports a few interfaces and a single function
 * `logAnalyticsEvent` which is a small wrapper around
 * Google Analytics service custom event logging.
 *************************************************************/

export interface ILogEvent {
  readonly tipType: string;
  readonly eventAction: string;
  readonly tabName: string;
  readonly location?: string;
}

// See Google Documentation on event logging and `fieldsObject` here:
// https://developers.google.com/analytics/devguides/collection/analyticsjs/events
interface IGAData {
  readonly eventCategory: string;
  readonly eventAction: string;
  readonly eventLabel: string;
}

interface IAnalyticsService {
  ga?: (send: "send", type: "event", data: IGAData) => void;
}

// We create a service that looks like Google's `window.ga` interface
// but merely logs to the console.
// TSLint doesn't like console messages.
const mockGa = {
  // tslint:disable no-console
  ga: (send: "send", type: "event", data: IGAData) => {
    console.group("Mock analytics send payload:");
    console.debug(send);
    console.debug(JSON.stringify(data, null, 2));
    console.groupEnd();
  }
  // tslint:enable no-console
};

export const logAnalyticsEvent = (event: ILogEvent) => {
  const windowWithPossibleGa = (window as IAnalyticsService);

  const payload: IGAData = {
    eventCategory: event.tipType,
    eventAction: event.eventAction,
    eventLabel: event.location ? event.location : event.tabName
  };

  // Above all do no harm:
  try {
    if (windowWithPossibleGa.ga instanceof Function) {
      windowWithPossibleGa.ga("send", "event", payload);
    } else {
      mockGa.ga("send", "event", payload);
    }
  } catch (e) {
    // tslint:disable no-console
    console.error("Unable to send Google Analytics");
    console.error(e);
    // tslint:enable no-console
  }

};
