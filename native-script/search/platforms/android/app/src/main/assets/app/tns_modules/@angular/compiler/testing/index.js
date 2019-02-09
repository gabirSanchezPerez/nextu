/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/testing", ["require", "exports", "tslib", "@angular/compiler/testing/public_api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    // This file is not used to build this module. It is only used during editing
    // by the TypeScript language service and during build for verification. `ngc`
    // replaces this file with production index.ts when it rewrites private symbol
    // names.
    tslib_1.__exportStar(require("@angular/compiler/testing/public_api"), exports);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb21waWxlci90ZXN0aW5nL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDZFQUE2RTtJQUM3RSw4RUFBOEU7SUFDOUUsOEVBQThFO0lBQzlFLFNBQVM7SUFFVCwrRUFBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRoaXMgZmlsZSBpcyBub3QgdXNlZCB0byBidWlsZCB0aGlzIG1vZHVsZS4gSXQgaXMgb25seSB1c2VkIGR1cmluZyBlZGl0aW5nXG4vLyBieSB0aGUgVHlwZVNjcmlwdCBsYW5ndWFnZSBzZXJ2aWNlIGFuZCBkdXJpbmcgYnVpbGQgZm9yIHZlcmlmaWNhdGlvbi4gYG5nY2Bcbi8vIHJlcGxhY2VzIHRoaXMgZmlsZSB3aXRoIHByb2R1Y3Rpb24gaW5kZXgudHMgd2hlbiBpdCByZXdyaXRlcyBwcml2YXRlIHN5bWJvbFxuLy8gbmFtZXMuXG5cbmV4cG9ydCAqIGZyb20gJy4vcHVibGljX2FwaSc7XG4iXX0=