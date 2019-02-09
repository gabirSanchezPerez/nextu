"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplaySubject_1 = require("../ReplaySubject");
var multicast_1 = require("./multicast");
/* tslint:enable:max-line-length */
function publishReplay(bufferSize, windowTime, selectorOrScheduler, scheduler) {
    if (selectorOrScheduler && typeof selectorOrScheduler !== 'function') {
        scheduler = selectorOrScheduler;
    }
    var selector = typeof selectorOrScheduler === 'function' ? selectorOrScheduler : undefined;
    var subject = new ReplaySubject_1.ReplaySubject(bufferSize, windowTime, scheduler);
    return function (source) { return multicast_1.multicast(function () { return subject; }, selector)(source); };
}
exports.publishReplay = publishReplay;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaFJlcGxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2hSZXBsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxrREFBaUQ7QUFDakQseUNBQXdDO0FBUXhDLG1DQUFtQztBQUVuQyxTQUFnQixhQUFhLENBQU8sVUFBbUIsRUFDbkIsVUFBbUIsRUFDbkIsbUJBQTRELEVBQzVELFNBQXlCO0lBRTNELElBQUksbUJBQW1CLElBQUksT0FBTyxtQkFBbUIsS0FBSyxVQUFVLEVBQUU7UUFDcEUsU0FBUyxHQUFHLG1CQUFtQixDQUFDO0tBQ2pDO0lBRUQsSUFBTSxRQUFRLEdBQUcsT0FBTyxtQkFBbUIsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDN0YsSUFBTSxPQUFPLEdBQUcsSUFBSSw2QkFBYSxDQUFJLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFeEUsT0FBTyxVQUFDLE1BQXFCLElBQUssT0FBQSxxQkFBUyxDQUFDLGNBQU0sT0FBQSxPQUFPLEVBQVAsQ0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBNkIsRUFBdEUsQ0FBc0UsQ0FBQztBQUMzRyxDQUFDO0FBYkQsc0NBYUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBSZXBsYXlTdWJqZWN0IH0gZnJvbSAnLi4vUmVwbGF5U3ViamVjdCc7XG5pbXBvcnQgeyBtdWx0aWNhc3QgfSBmcm9tICcuL211bHRpY2FzdCc7XG5pbXBvcnQgeyBDb25uZWN0YWJsZU9ic2VydmFibGUgfSBmcm9tICcuLi9vYnNlcnZhYmxlL0Nvbm5lY3RhYmxlT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBVbmFyeUZ1bmN0aW9uLCBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9wZXJhdG9yRnVuY3Rpb24sIFNjaGVkdWxlckxpa2UgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8qIHRzbGludDpkaXNhYmxlOm1heC1saW5lLWxlbmd0aCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hSZXBsYXk8VD4oYnVmZmVyU2l6ZT86IG51bWJlciwgd2luZG93VGltZT86IG51bWJlciwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPjtcbmV4cG9ydCBmdW5jdGlvbiBwdWJsaXNoUmVwbGF5PFQsIFI+KGJ1ZmZlclNpemU/OiBudW1iZXIsIHdpbmRvd1RpbWU/OiBudW1iZXIsIHNlbGVjdG9yPzogT3BlcmF0b3JGdW5jdGlvbjxULCBSPiwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IE9wZXJhdG9yRnVuY3Rpb248VCwgUj47XG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaFJlcGxheTxUPihidWZmZXJTaXplPzogbnVtYmVyLCB3aW5kb3dUaW1lPzogbnVtYmVyLCBzZWxlY3Rvcj86IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPjtcbi8qIHRzbGludDplbmFibGU6bWF4LWxpbmUtbGVuZ3RoICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwdWJsaXNoUmVwbGF5PFQsIFI+KGJ1ZmZlclNpemU/OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dUaW1lPzogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3JPclNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UgfCBPcGVyYXRvckZ1bmN0aW9uPFQsIFI+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IFVuYXJ5RnVuY3Rpb248T2JzZXJ2YWJsZTxUPiwgQ29ubmVjdGFibGVPYnNlcnZhYmxlPFI+PiB7XG5cbiAgaWYgKHNlbGVjdG9yT3JTY2hlZHVsZXIgJiYgdHlwZW9mIHNlbGVjdG9yT3JTY2hlZHVsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICBzY2hlZHVsZXIgPSBzZWxlY3Rvck9yU2NoZWR1bGVyO1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0b3IgPSB0eXBlb2Ygc2VsZWN0b3JPclNjaGVkdWxlciA9PT0gJ2Z1bmN0aW9uJyA/IHNlbGVjdG9yT3JTY2hlZHVsZXIgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHN1YmplY3QgPSBuZXcgUmVwbGF5U3ViamVjdDxUPihidWZmZXJTaXplLCB3aW5kb3dUaW1lLCBzY2hlZHVsZXIpO1xuXG4gIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPFQ+KSA9PiBtdWx0aWNhc3QoKCkgPT4gc3ViamVjdCwgc2VsZWN0b3IpKHNvdXJjZSkgYXMgQ29ubmVjdGFibGVPYnNlcnZhYmxlPFI+O1xufVxuIl19