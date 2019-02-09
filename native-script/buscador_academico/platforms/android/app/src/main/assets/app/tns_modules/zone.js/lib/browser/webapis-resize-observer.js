/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('ResizeObserver', function (global, Zone, api) {
    var ResizeObserver = global['ResizeObserver'];
    if (!ResizeObserver) {
        return;
    }
    var resizeObserverSymbol = api.symbol('ResizeObserver');
    api.patchMethod(global, 'ResizeObserver', function (delegate) { return function (self, args) {
        var callback = args.length > 0 ? args[0] : null;
        if (callback) {
            args[0] = function (entries, observer) {
                var _this = this;
                var zones = {};
                var currZone = Zone.current;
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var entry = entries_1[_i];
                    var zone = entry.target[resizeObserverSymbol];
                    if (!zone) {
                        zone = currZone;
                    }
                    var zoneEntriesInfo = zones[zone.name];
                    if (!zoneEntriesInfo) {
                        zones[zone.name] = zoneEntriesInfo = { entries: [], zone: zone };
                    }
                    zoneEntriesInfo.entries.push(entry);
                }
                Object.keys(zones).forEach(function (zoneName) {
                    var zoneEntriesInfo = zones[zoneName];
                    if (zoneEntriesInfo.zone !== Zone.current) {
                        zoneEntriesInfo.zone.run(callback, _this, [zoneEntriesInfo.entries, observer], 'ResizeObserver');
                    }
                    else {
                        callback.call(_this, zoneEntriesInfo.entries, observer);
                    }
                });
            };
        }
        return args.length > 0 ? new ResizeObserver(args[0]) : new ResizeObserver();
    }; });
    api.patchMethod(ResizeObserver.prototype, 'observe', function (delegate) { return function (self, args) {
        var target = args.length > 0 ? args[0] : null;
        if (!target) {
            return delegate.apply(self, args);
        }
        var targets = self[resizeObserverSymbol];
        if (!targets) {
            targets = self[resizeObserverSymbol] = [];
        }
        targets.push(target);
        target[resizeObserverSymbol] = Zone.current;
        return delegate.apply(self, args);
    }; });
    api.patchMethod(ResizeObserver.prototype, 'unobserve', function (delegate) { return function (self, args) {
        var target = args.length > 0 ? args[0] : null;
        if (!target) {
            return delegate.apply(self, args);
        }
        var targets = self[resizeObserverSymbol];
        if (targets) {
            for (var i = 0; i < targets.length; i++) {
                if (targets[i] === target) {
                    targets.splice(i, 1);
                    break;
                }
            }
        }
        target[resizeObserverSymbol] = undefined;
        return delegate.apply(self, args);
    }; });
    api.patchMethod(ResizeObserver.prototype, 'disconnect', function (delegate) { return function (self, args) {
        var targets = self[resizeObserverSymbol];
        if (targets) {
            targets.forEach(function (target) {
                target[resizeObserverSymbol] = undefined;
            });
            self[resizeObserverSymbol] = undefined;
        }
        return delegate.apply(self, args);
    }; });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViYXBpcy1yZXNpemUtb2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZWJhcGlzLXJlc2l6ZS1vYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLFVBQUMsTUFBVyxFQUFFLElBQVMsRUFBRSxHQUFpQjtJQUM1RSxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNoRCxJQUFJLENBQUMsY0FBYyxFQUFFO1FBQ25CLE9BQU87S0FDUjtJQUVELElBQU0sb0JBQW9CLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTFELEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLFVBQUMsUUFBa0IsSUFBSyxPQUFBLFVBQUMsSUFBUyxFQUFFLElBQVc7UUFDdkYsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2xELElBQUksUUFBUSxFQUFFO1lBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVMsT0FBWSxFQUFFLFFBQWE7Z0JBQXBDLGlCQXdCVDtnQkF2QkMsSUFBTSxLQUFLLEdBQThCLEVBQUUsQ0FBQztnQkFDNUMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDOUIsS0FBa0IsVUFBTyxFQUFQLG1CQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPLEVBQUU7b0JBQXRCLElBQUksS0FBSyxnQkFBQTtvQkFDWixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7b0JBQzlDLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ1QsSUFBSSxHQUFHLFFBQVEs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QUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxFQUFFO29CQUN6QixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDckIsTUFBTTtpQkFDUDthQUNGO1NBQ0Y7UUFDRCxNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDekMsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDLEVBaEI4RCxDQWdCOUQsQ0FBQyxDQUFDO0lBRVAsR0FBRyxDQUFDLFdBQVcsQ0FDWCxjQUFjLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFDLFFBQWtCLElBQUssT0FBQSxVQUFDLElBQVMsRUFBRSxJQUFXO1FBQ3JGLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNDLElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQVc7Z0JBQzFCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLFNBQVMsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLFNBQVMsQ0FBQztTQUN4QztRQUNELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQyxFQVQrRCxDQVMvRCxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblpvbmUuX19sb2FkX3BhdGNoKCdSZXNpemVPYnNlcnZlcicsIChnbG9iYWw6IGFueSwgWm9uZTogYW55LCBhcGk6IF9ab25lUHJpdmF0ZSkgPT4ge1xuICBjb25zdCBSZXNpemVPYnNlcnZlciA9IGdsb2JhbFsnUmVzaXplT2JzZXJ2ZXInXTtcbiAgaWYgKCFSZXNpemVPYnNlcnZlcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJlc2l6ZU9ic2VydmVyU3ltYm9sID0gYXBpLnN5bWJvbCgnUmVzaXplT2JzZXJ2ZXInKTtcblxuICBhcGkucGF0Y2hNZXRob2QoZ2xvYmFsLCAnUmVzaXplT2JzZXJ2ZXInLCAoZGVsZWdhdGU6IEZ1bmN0aW9uKSA9PiAoc2VsZjogYW55LCBhcmdzOiBhbnlbXSkgPT4ge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gYXJncy5sZW5ndGggPiAwID8gYXJnc1swXSA6IG51bGw7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBhcmdzWzBdID0gZnVuY3Rpb24oZW50cmllczogYW55LCBvYnNlcnZlcjogYW55KSB7XG4gICAgICAgIGNvbnN0IHpvbmVzOiB7W3pvbmVOYW1lOiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgICAgIGNvbnN0IGN1cnJab25lID0gWm9uZS5jdXJyZW50O1xuICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgbGV0IHpvbmUgPSBlbnRyeS50YXJnZXRbcmVzaXplT2JzZXJ2ZXJTeW1ib2xdO1xuICAgICAgICAgIGlmICghem9uZSkge1xuICAgICAgICAgICAgem9uZSA9IGN1cnJab25lO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgem9uZUVudHJpZXNJbmZvID0gem9uZXNbem9uZS5uYW1lXTtcbiAgICAgICAgICBpZiAoIXpvbmVFbnRyaWVzSW5mbykge1xuICAgICAgICAgICAgem9uZXNbem9uZS5uYW1lXSA9IHpvbmVFbnRyaWVzSW5mbyA9IHtlbnRyaWVzOiBbXSwgem9uZTogem9uZX07XG4gICAgICAgICAgfVxuICAgICAgICAgIHpvbmVFbnRyaWVzSW5mby5lbnRyaWVzLnB1c2goZW50cnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmtleXMoem9uZXMpLmZvckVhY2goem9uZU5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IHpvbmVFbnRyaWVzSW5mbyA9IHpvbmVzW3pvbmVOYW1lXTtcbiAgICAgICAgICBpZiAoem9uZUVudHJpZXNJbmZvLnpvbmUgIT09IFpvbmUuY3VycmVudCkge1xuICAgICAgICAgICAgem9uZUVudHJpZXNJbmZvLnpvbmUucnVuKFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLCB0aGlzLCBbem9uZUVudHJpZXNJbmZvLmVudHJpZXMsIG9ic2VydmVyXSwgJ1Jlc2l6ZU9ic2VydmVyJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgem9uZUVudHJpZXNJbmZvLmVudHJpZXMsIG9ic2VydmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3MubGVuZ3RoID4gMCA/IG5ldyBSZXNpemVPYnNlcnZlcihhcmdzWzBdKSA6IG5ldyBSZXNpemVPYnNlcnZlcigpO1xuICB9KTtcblxuICBhcGkucGF0Y2hNZXRob2QoXG4gICAgICBSZXNpemVPYnNlcnZlci5wcm90b3R5cGUsICdvYnNlcnZlJywgKGRlbGVnYXRlOiBGdW5jdGlvbikgPT4gKHNlbGY6IGFueSwgYXJnczogYW55W10pID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXJncy5sZW5ndGggPiAwID8gYXJnc1swXSA6IG51bGw7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0YXJnZXRzID0gc2VsZltyZXNpemVPYnNlcnZlclN5bWJvbF07XG4gICAgICAgIGlmICghdGFyZ2V0cykge1xuICAgICAgICAgIHRhcmdldHMgPSBzZWxmW3Jlc2l6ZU9ic2VydmVyU3ltYm9sXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldHMucHVzaCh0YXJnZXQpO1xuICAgICAgICB0YXJnZXRbcmVzaXplT2JzZXJ2ZXJTeW1ib2xdID0gWm9uZS5jdXJyZW50O1xuICAgICAgICByZXR1cm4gZGVsZWdhdGUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICB9KTtcblxuICBhcGkucGF0Y2hNZXRob2QoXG4gICAgICBSZXNpemVPYnNlcnZlci5wcm90b3R5cGUsICd1bm9ic2VydmUnLCAoZGVsZWdhdGU6IEZ1bmN0aW9uKSA9PiAoc2VsZjogYW55LCBhcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBhcmdzLmxlbmd0aCA+IDAgPyBhcmdzWzBdIDogbnVsbDtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICByZXR1cm4gZGVsZWdhdGUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRhcmdldHMgPSBzZWxmW3Jlc2l6ZU9ic2VydmVyU3ltYm9sXTtcbiAgICAgICAgaWYgKHRhcmdldHMpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0YXJnZXRzW2ldID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgdGFyZ2V0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRbcmVzaXplT2JzZXJ2ZXJTeW1ib2xdID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gZGVsZWdhdGUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICB9KTtcblxuICBhcGkucGF0Y2hNZXRob2QoXG4gICAgICBSZXNpemVPYnNlcnZlci5wcm90b3R5cGUsICdkaXNjb25uZWN0JywgKGRlbGVnYXRlOiBGdW5jdGlvbikgPT4gKHNlbGY6IGFueSwgYXJnczogYW55W10pID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHNlbGZbcmVzaXplT2JzZXJ2ZXJTeW1ib2xdO1xuICAgICAgICBpZiAodGFyZ2V0cykge1xuICAgICAgICAgIHRhcmdldHMuZm9yRWFjaCgodGFyZ2V0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRhcmdldFtyZXNpemVPYnNlcnZlclN5bWJvbF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2VsZltyZXNpemVPYnNlcnZlclN5bWJvbF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgfSk7XG59KTtcbiJdfQ==