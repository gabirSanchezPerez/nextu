"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SubscriptionLog_1 = require("./SubscriptionLog");
var SubscriptionLoggable = /** @class */ (function () {
    function SubscriptionLoggable() {
        this.subscriptions = [];
    }
    SubscriptionLoggable.prototype.logSubscribedFrame = function () {
        this.subscriptions.push(new SubscriptionLog_1.SubscriptionLog(this.scheduler.now()));
        return this.subscriptions.length - 1;
    };
    SubscriptionLoggable.prototype.logUnsubscribedFrame = function (index) {
        var subscriptionLogs = this.subscriptions;
        var oldSubscriptionLog = subscriptionLogs[index];
        subscriptionLogs[index] = new SubscriptionLog_1.SubscriptionLog(oldSubscriptionLog.subscribedFrame, this.scheduler.now());
    };
    return SubscriptionLoggable;
}());
exports.SubscriptionLoggable = SubscriptionLoggable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaXB0aW9uTG9nZ2FibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTdWJzY3JpcHRpb25Mb2dnYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFEQUFvRDtBQUVwRDtJQUFBO1FBQ1Msa0JBQWEsR0FBc0IsRUFBRSxDQUFDO0lBZ0IvQyxDQUFDO0lBYkMsaURBQWtCLEdBQWxCO1FBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQ0FBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxtREFBb0IsR0FBcEIsVUFBcUIsS0FBYTtRQUNoQyxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDNUMsSUFBTSxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLGlDQUFlLENBQzNDLGtCQUFrQixDQUFDLGVBQWUsRUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FDckIsQ0FBQztJQUNKLENBQUM7SUFDSCwyQkFBQztBQUFELENBQUMsQUFqQkQsSUFpQkM7QUFqQlksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2NoZWR1bGVyIH0gZnJvbSAnLi4vU2NoZWR1bGVyJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbkxvZyB9IGZyb20gJy4vU3Vic2NyaXB0aW9uTG9nJztcblxuZXhwb3J0IGNsYXNzIFN1YnNjcmlwdGlvbkxvZ2dhYmxlIHtcbiAgcHVibGljIHN1YnNjcmlwdGlvbnM6IFN1YnNjcmlwdGlvbkxvZ1tdID0gW107XG4gIHNjaGVkdWxlcjogU2NoZWR1bGVyO1xuXG4gIGxvZ1N1YnNjcmliZWRGcmFtZSgpOiBudW1iZXIge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKG5ldyBTdWJzY3JpcHRpb25Mb2codGhpcy5zY2hlZHVsZXIubm93KCkpKTtcbiAgICByZXR1cm4gdGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aCAtIDE7XG4gIH1cblxuICBsb2dVbnN1YnNjcmliZWRGcmFtZShpbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uTG9ncyA9IHRoaXMuc3Vic2NyaXB0aW9ucztcbiAgICBjb25zdCBvbGRTdWJzY3JpcHRpb25Mb2cgPSBzdWJzY3JpcHRpb25Mb2dzW2luZGV4XTtcbiAgICBzdWJzY3JpcHRpb25Mb2dzW2luZGV4XSA9IG5ldyBTdWJzY3JpcHRpb25Mb2coXG4gICAgICBvbGRTdWJzY3JpcHRpb25Mb2cuc3Vic2NyaWJlZEZyYW1lLFxuICAgICAgdGhpcy5zY2hlZHVsZXIubm93KClcbiAgICApO1xuICB9XG59XG4iXX0=