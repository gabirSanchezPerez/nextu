/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { createComponent, createContentChild, createContentChildren, createDirective, createHostBinding, createHostListener, createInput, createOutput, createViewChild, createViewChildren } from './core';
import { resolveForwardRef, splitAtColon, stringify } from './util';
const QUERY_METADATA_IDENTIFIERS = [
    createViewChild,
    createViewChildren,
    createContentChild,
    createContentChildren,
];
/*
 * Resolve a `Type` for {@link Directive}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export class DirectiveResolver {
    constructor(_reflector) {
        this._reflector = _reflector;
    }
    isDirective(type) {
        const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
        return typeMetadata && typeMetadata.some(isDirectiveMetadata);
    }
    resolve(type, throwIfNotFound = true) {
        const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
        if (typeMetadata) {
            const metadata = findLast(typeMetadata, isDirectiveMetadata);
            if (metadata) {
                const propertyMetadata = this._reflector.propMetadata(type);
                const guards = this._reflector.guards(type);
                return this._mergeWithPropertyMetadata(metadata, propertyMetadata, guards, type);
            }
        }
        if (throwIfNotFound) {
            throw new Error(`No Directive annotation found on ${stringify(type)}`);
        }
        return null;
    }
    _mergeWithPropertyMetadata(dm, propertyMetadata, guards, directiveType) {
        const inputs = [];
        const outputs = [];
        const host = {};
        const queries = {};
        Object.keys(propertyMetadata).forEach((propName) => {
            const input = findLast(propertyMetadata[propName], (a) => createInput.isTypeOf(a));
            if (input) {
                if (input.bindingPropertyName) {
                    inputs.push(`${propName}: ${input.bindingPropertyName}`);
                }
                else {
                    inputs.push(propName);
                }
            }
            const output = findLast(propertyMetadata[propName], (a) => createOutput.isTypeOf(a));
            if (output) {
                if (output.bindingPropertyName) {
                    outputs.push(`${propName}: ${output.bindingPropertyName}`);
                }
                else {
                    outputs.push(propName);
                }
            }
            const hostBindings = propertyMetadata[propName].filter(a => createHostBinding.isTypeOf(a));
            hostBindings.forEach(hostBinding => {
                if (hostBinding.hostPropertyName) {
                    const startWith = hostBinding.hostPropertyName[0];
                    if (startWith === '(') {
                        throw new Error(`@HostBinding can not bind to events. Use @HostListener instead.`);
                    }
                    else if (startWith === '[') {
                        throw new Error(`@HostBinding parameter should be a property name, 'class.<name>', or 'attr.<name>'.`);
                    }
                    host[`[${hostBinding.hostPropertyName}]`] = propName;
                }
                else {
                    host[`[${propName}]`] = propName;
                }
            });
            const hostListeners = propertyMetadata[propName].filter(a => createHostListener.isTypeOf(a));
            hostListeners.forEach(hostListener => {
                const args = hostListener.args || [];
                host[`(${hostListener.eventName})`] = `${propName}(${args.join(',')})`;
            });
            const query = findLast(propertyMetadata[propName], (a) => QUERY_METADATA_IDENTIFIERS.some(i => i.isTypeOf(a)));
            if (query) {
                queries[propName] = query;
            }
        });
        return this._merge(dm, inputs, outputs, host, queries, guards, directiveType);
    }
    _extractPublicName(def) { return splitAtColon(def, [null, def])[1].trim(); }
    _dedupeBindings(bindings) {
        const names = new Set();
        const publicNames = new Set();
        const reversedResult = [];
        // go last to first to allow later entries to overwrite previous entries
        for (let i = bindings.length - 1; i >= 0; i--) {
            const binding = bindings[i];
            const name = this._extractPublicName(binding);
            publicNames.add(name);
            if (!names.has(name)) {
                names.add(name);
                reversedResult.push(binding);
            }
        }
        return reversedResult.reverse();
    }
    _merge(directive, inputs, outputs, host, queries, guards, directiveType) {
        const mergedInputs = this._dedupeBindings(directive.inputs ? directive.inputs.concat(inputs) : inputs);
        const mergedOutputs = this._dedupeBindings(directive.outputs ? directive.outputs.concat(outputs) : outputs);
        const mergedHost = directive.host ? Object.assign({}, directive.host, host) : host;
        const mergedQueries = directive.queries ? Object.assign({}, directive.queries, queries) : queries;
        if (createComponent.isTypeOf(directive)) {
            const comp = directive;
            return createComponent({
                selector: comp.selector,
                inputs: mergedInputs,
                outputs: mergedOutputs,
                host: mergedHost,
                exportAs: comp.exportAs,
                moduleId: comp.moduleId,
                queries: mergedQueries,
                changeDetection: comp.changeDetection,
                providers: comp.providers,
                viewProviders: comp.viewProviders,
                entryComponents: comp.entryComponents,
                template: comp.template,
                templateUrl: comp.templateUrl,
                styles: comp.styles,
                styleUrls: comp.styleUrls,
                encapsulation: comp.encapsulation,
                animations: comp.animations,
                interpolation: comp.interpolation,
                preserveWhitespaces: directive.preserveWhitespaces,
            });
        }
        else {
            return createDirective({
                selector: directive.selector,
                inputs: mergedInputs,
                outputs: mergedOutputs,
                host: mergedHost,
                exportAs: directive.exportAs,
                queries: mergedQueries,
                providers: directive.providers, guards
            });
        }
    }
}
function isDirectiveMetadata(type) {
    return createDirective.isTypeOf(type) || createComponent.isTypeOf(type);
}
export function findLast(arr, condition) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (condition(arr[i])) {
            return arr[i];
        }
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tcGlsZXIvc3JjL2RpcmVjdGl2ZV9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQTZCLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDdE8sT0FBTyxFQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFbEUsTUFBTSwwQkFBMEIsR0FBRztJQUNqQyxlQUFlO0lBQ2Ysa0JBQWtCO0lBQ2xCLGtCQUFrQjtJQUNsQixxQkFBcUI7Q0FDdEIsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyxpQkFBaUI7SUFDNUIsWUFBb0IsVUFBNEI7UUFBNUIsZUFBVSxHQUFWLFVBQVUsQ0FBa0I7SUFBRyxDQUFDO0lBRXBELFdBQVcsQ0FBQyxJQUFVO1FBQ3BCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUUsT0FBTyxZQUFZLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFRRCxPQUFPLENBQUMsSUFBVSxFQUFFLGVBQWUsR0FBRyxJQUFJO1FBQ3hDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxZQUFZLEVBQUU7WUFDaEIsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFlBQVksRUFBRSxt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LENBQUMsbUJBQW1CO2FBQ25ELENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxPQUFPLGVBQWUsQ0FBQztnQkFDckIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO2dCQUM1QixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsT0FBTyxFQUFFLGFBQWE7Z0JBQ3RCLElBQUksRUFBRSxVQUFVO2dCQUNoQixRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7Z0JBQzVCLE9BQU8sRUFBRSxhQUFhO2dCQUN0QixTQUFTLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNO2FBQ3ZDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztDQUNGO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxJQUFTO0lBQ3BDLE9BQU8sZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFFLENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFJLEdBQVEsRUFBRSxTQUFnQztJQUNwRSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDckIsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDZjtLQUNGO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4vY29tcGlsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtDb21wb25lbnQsIERpcmVjdGl2ZSwgVHlwZSwgY3JlYXRlQ29tcG9uZW50LCBjcmVhdGVDb250ZW50Q2hpbGQsIGNyZWF0ZUNvbnRlbnRDaGlsZHJlbiwgY3JlYXRlRGlyZWN0aXZlLCBjcmVhdGVIb3N0QmluZGluZywgY3JlYXRlSG9zdExpc3RlbmVyLCBjcmVhdGVJbnB1dCwgY3JlYXRlT3V0cHV0LCBjcmVhdGVWaWV3Q2hpbGQsIGNyZWF0ZVZpZXdDaGlsZHJlbn0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWYsIHNwbGl0QXRDb2xvbiwgc3RyaW5naWZ5fSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBRVUVSWV9NRVRBREFUQV9JREVOVElGSUVSUyA9IFtcbiAgY3JlYXRlVmlld0NoaWxkLFxuICBjcmVhdGVWaWV3Q2hpbGRyZW4sXG4gIGNyZWF0ZUNvbnRlbnRDaGlsZCxcbiAgY3JlYXRlQ29udGVudENoaWxkcmVuLFxuXTtcblxuLypcbiAqIFJlc29sdmUgYSBgVHlwZWAgZm9yIHtAbGluayBEaXJlY3RpdmV9LlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgdG8gY3JlYXRlIGN1c3RvbSBiZWhhdmlvci5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBpbGVyfVxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlUmVzb2x2ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IpIHt9XG5cbiAgaXNEaXJlY3RpdmUodHlwZTogVHlwZSkge1xuICAgIGNvbnN0IHR5cGVNZXRhZGF0YSA9IHRoaXMuX3JlZmxlY3Rvci5hbm5vdGF0aW9ucyhyZXNvbHZlRm9yd2FyZFJlZih0eXBlKSk7XG4gICAgcmV0dXJuIHR5cGVNZXRhZGF0YSAmJiB0eXBlTWV0YWRhdGEuc29tZShpc0RpcmVjdGl2ZU1ldGFkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4ge0BsaW5rIERpcmVjdGl2ZX0gZm9yIGEgZ2l2ZW4gYFR5cGVgLlxuICAgKi9cbiAgcmVzb2x2ZSh0eXBlOiBUeXBlKTogRGlyZWN0aXZlO1xuICByZXNvbHZlKHR5cGU6IFR5cGUsIHRocm93SWZOb3RGb3VuZDogdHJ1ZSk6IERpcmVjdGl2ZTtcbiAgcmVzb2x2ZSh0eXBlOiBUeXBlLCB0aHJvd0lmTm90Rm91bmQ6IGJvb2xlYW4pOiBEaXJlY3RpdmV8bnVsbDtcbiAgcmVzb2x2ZSh0eXBlOiBUeXBlLCB0aHJvd0lmTm90Rm91bmQgPSB0cnVlKTogRGlyZWN0aXZlfG51bGwge1xuICAgIGNvbnN0IHR5cGVNZXRhZGF0YSA9IHRoaXMuX3JlZmxlY3Rvci5hbm5vdGF0aW9ucyhyZXNvbHZlRm9yd2FyZFJlZih0eXBlKSk7XG4gICAgaWYgKHR5cGVNZXRhZGF0YSkge1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSBmaW5kTGFzdCh0eXBlTWV0YWRhdGEsIGlzRGlyZWN0aXZlTWV0YWRhdGEpO1xuICAgICAgaWYgKG1ldGFkYXRhKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5TWV0YWRhdGEgPSB0aGlzLl9yZWZsZWN0b3IucHJvcE1ldGFkYXRhKHR5cGUpO1xuICAgICAgICBjb25zdCBndWFyZHMgPSB0aGlzLl9yZWZsZWN0b3IuZ3VhcmRzKHR5cGUpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbWVyZ2VXaXRoUHJvcGVydHlNZXRhZGF0YShtZXRhZGF0YSwgcHJvcGVydHlNZXRhZGF0YSwgZ3VhcmRzLCB0eXBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhyb3dJZk5vdEZvdW5kKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIERpcmVjdGl2ZSBhbm5vdGF0aW9uIGZvdW5kIG9uICR7c3RyaW5naWZ5KHR5cGUpfWApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWVyZ2VXaXRoUHJvcGVydHlNZXRhZGF0YShcbiAgICAgIGRtOiBEaXJlY3RpdmUsIHByb3BlcnR5TWV0YWRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnlbXX0sIGd1YXJkczoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgICBkaXJlY3RpdmVUeXBlOiBUeXBlKTogRGlyZWN0aXZlIHtcbiAgICBjb25zdCBpbnB1dHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3Qgb3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IHF1ZXJpZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgT2JqZWN0LmtleXMocHJvcGVydHlNZXRhZGF0YSkuZm9yRWFjaCgocHJvcE5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgaW5wdXQgPSBmaW5kTGFzdChwcm9wZXJ0eU1ldGFkYXRhW3Byb3BOYW1lXSwgKGEpID0+IGNyZWF0ZUlucHV0LmlzVHlwZU9mKGEpKTtcbiAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICBpZiAoaW5wdXQuYmluZGluZ1Byb3BlcnR5TmFtZSkge1xuICAgICAgICAgIGlucHV0cy5wdXNoKGAke3Byb3BOYW1lfTogJHtpbnB1dC5iaW5kaW5nUHJvcGVydHlOYW1lfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlucHV0cy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3Qgb3V0cHV0ID0gZmluZExhc3QocHJvcGVydHlNZXRhZGF0YVtwcm9wTmFtZV0sIChhKSA9PiBjcmVhdGVPdXRwdXQuaXNUeXBlT2YoYSkpO1xuICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICBpZiAob3V0cHV0LmJpbmRpbmdQcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICBvdXRwdXRzLnB1c2goYCR7cHJvcE5hbWV9OiAke291dHB1dC5iaW5kaW5nUHJvcGVydHlOYW1lfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dHB1dHMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGhvc3RCaW5kaW5ncyA9IHByb3BlcnR5TWV0YWRhdGFbcHJvcE5hbWVdLmZpbHRlcihhID0+IGNyZWF0ZUhvc3RCaW5kaW5nLmlzVHlwZU9mKGEpKTtcbiAgICAgIGhvc3RCaW5kaW5ncy5mb3JFYWNoKGhvc3RCaW5kaW5nID0+IHtcbiAgICAgICAgaWYgKGhvc3RCaW5kaW5nLmhvc3RQcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICBjb25zdCBzdGFydFdpdGggPSBob3N0QmluZGluZy5ob3N0UHJvcGVydHlOYW1lWzBdO1xuICAgICAgICAgIGlmIChzdGFydFdpdGggPT09ICcoJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBASG9zdEJpbmRpbmcgY2FuIG5vdCBiaW5kIHRvIGV2ZW50cy4gVXNlIEBIb3N0TGlzdGVuZXIgaW5zdGVhZC5gKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0V2l0aCA9PT0gJ1snKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEBIb3N0QmluZGluZyBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgcHJvcGVydHkgbmFtZSwgJ2NsYXNzLjxuYW1lPicsIG9yICdhdHRyLjxuYW1lPicuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGhvc3RbYFske2hvc3RCaW5kaW5nLmhvc3RQcm9wZXJ0eU5hbWV9XWBdID0gcHJvcE5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaG9zdFtgWyR7cHJvcE5hbWV9XWBdID0gcHJvcE5hbWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgaG9zdExpc3RlbmVycyA9IHByb3BlcnR5TWV0YWRhdGFbcHJvcE5hbWVdLmZpbHRlcihhID0+IGNyZWF0ZUhvc3RMaXN0ZW5lci5pc1R5cGVPZihhKSk7XG4gICAgICBob3N0TGlzdGVuZXJzLmZvckVhY2goaG9zdExpc3RlbmVyID0+IHtcbiAgICAgICAgY29uc3QgYXJncyA9IGhvc3RMaXN0ZW5lci5hcmdzIHx8IFtdO1xuICAgICAgICBob3N0W2AoJHtob3N0TGlzdGVuZXIuZXZlbnROYW1lfSlgXSA9IGAke3Byb3BOYW1lfSgke2FyZ3Muam9pbignLCcpfSlgO1xuICAgICAgfSk7XG4gICAgICBjb25zdCBxdWVyeSA9IGZpbmRMYXN0KFxuICAgICAgICAgIHByb3BlcnR5TWV0YWRhdGFbcHJvcE5hbWVdLCAoYSkgPT4gUVVFUllfTUVUQURBVEFfSURFTlRJRklFUlMuc29tZShpID0+IGkuaXNUeXBlT2YoYSkpKTtcbiAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICBxdWVyaWVzW3Byb3BOYW1lXSA9IHF1ZXJ5O1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9tZXJnZShkbSwgaW5wdXRzLCBvdXRwdXRzLCBob3N0LCBxdWVyaWVzLCBndWFyZHMsIGRpcmVjdGl2ZVR5cGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdFB1YmxpY05hbWUoZGVmOiBzdHJpbmcpIHsgcmV0dXJuIHNwbGl0QXRDb2xvbihkZWYsIFtudWxsICEsIGRlZl0pWzFdLnRyaW0oKTsgfVxuXG4gIHByaXZhdGUgX2RlZHVwZUJpbmRpbmdzKGJpbmRpbmdzOiBzdHJpbmdbXSk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBuYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHB1YmxpY05hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgcmV2ZXJzZWRSZXN1bHQ6IHN0cmluZ1tdID0gW107XG4gICAgLy8gZ28gbGFzdCB0byBmaXJzdCB0byBhbGxvdyBsYXRlciBlbnRyaWVzIHRvIG92ZXJ3cml0ZSBwcmV2aW91cyBlbnRyaWVzXG4gICAgZm9yIChsZXQgaSA9IGJpbmRpbmdzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBiaW5kaW5nID0gYmluZGluZ3NbaV07XG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5fZXh0cmFjdFB1YmxpY05hbWUoYmluZGluZyk7XG4gICAgICBwdWJsaWNOYW1lcy5hZGQobmFtZSk7XG4gICAgICBpZiAoIW5hbWVzLmhhcyhuYW1lKSkge1xuICAgICAgICBuYW1lcy5hZGQobmFtZSk7XG4gICAgICAgIHJldmVyc2VkUmVzdWx0LnB1c2goYmluZGluZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXZlcnNlZFJlc3VsdC5yZXZlcnNlKCk7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZShcbiAgICAgIGRpcmVjdGl2ZTogRGlyZWN0aXZlLCBpbnB1dHM6IHN0cmluZ1tdLCBvdXRwdXRzOiBzdHJpbmdbXSwgaG9zdDoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICBxdWVyaWVzOiB7W2tleTogc3RyaW5nXTogYW55fSwgZ3VhcmRzOiB7W2tleTogc3RyaW5nXTogYW55fSwgZGlyZWN0aXZlVHlwZTogVHlwZSk6IERpcmVjdGl2ZSB7XG4gICAgY29uc3QgbWVyZ2VkSW5wdXRzID1cbiAgICAgICAgdGhpcy5fZGVkdXBlQmluZGluZ3MoZGlyZWN0aXZlLmlucHV0cyA/IGRpcmVjdGl2ZS5pbnB1dHMuY29uY2F0KGlucHV0cykgOiBpbnB1dHMpO1xuICAgIGNvbnN0IG1lcmdlZE91dHB1dHMgPVxuICAgICAgICB0aGlzLl9kZWR1cGVCaW5kaW5ncyhkaXJlY3RpdmUub3V0cHV0cyA/IGRpcmVjdGl2ZS5vdXRwdXRzLmNvbmNhdChvdXRwdXRzKSA6IG91dHB1dHMpO1xuICAgIGNvbnN0IG1lcmdlZEhvc3QgPSBkaXJlY3RpdmUuaG9zdCA/IHsuLi5kaXJlY3RpdmUuaG9zdCwgLi4uaG9zdH0gOiBob3N0O1xuICAgIGNvbnN0IG1lcmdlZFF1ZXJpZXMgPSBkaXJlY3RpdmUucXVlcmllcyA/IHsuLi5kaXJlY3RpdmUucXVlcmllcywgLi4ucXVlcmllc30gOiBxdWVyaWVzO1xuICAgIGlmIChjcmVhdGVDb21wb25lbnQuaXNUeXBlT2YoZGlyZWN0aXZlKSkge1xuICAgICAgY29uc3QgY29tcCA9IGRpcmVjdGl2ZSBhcyBDb21wb25lbnQ7XG4gICAgICByZXR1cm4gY3JlYXRlQ29tcG9uZW50KHtcbiAgICAgICAgc2VsZWN0b3I6IGNvbXAuc2VsZWN0b3IsXG4gICAgICAgIGlucHV0czogbWVyZ2VkSW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBtZXJnZWRPdXRwdXRzLFxuICAgICAgICBob3N0OiBtZXJnZWRIb3N0LFxuICAgICAgICBleHBvcnRBczogY29tcC5leHBvcnRBcyxcbiAgICAgICAgbW9kdWxlSWQ6IGNvbXAubW9kdWxlSWQsXG4gICAgICAgIHF1ZXJpZXM6IG1lcmdlZFF1ZXJpZXMsXG4gICAgICAgIGNoYW5nZURldGVjdGlvbjogY29tcC5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgIHByb3ZpZGVyczogY29tcC5wcm92aWRlcnMsXG4gICAgICAgIHZpZXdQcm92aWRlcnM6IGNvbXAudmlld1Byb3ZpZGVycyxcbiAgICAgICAgZW50cnlDb21wb25lbnRzOiBjb21wLmVudHJ5Q29tcG9uZW50cyxcbiAgICAgICAgdGVtcGxhdGU6IGNvbXAudGVtcGxhdGUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiBjb21wLnRlbXBsYXRlVXJsLFxuICAgICAgICBzdHlsZXM6IGNvbXAuc3R5bGVzLFxuICAgICAgICBzdHlsZVVybHM6IGNvbXAuc3R5bGVVcmxzLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiBjb21wLmVuY2Fwc3VsYXRpb24sXG4gICAgICAgIGFuaW1hdGlvbnM6IGNvbXAuYW5pbWF0aW9ucyxcbiAgICAgICAgaW50ZXJwb2xhdGlvbjogY29tcC5pbnRlcnBvbGF0aW9uLFxuICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBkaXJlY3RpdmUucHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3JlYXRlRGlyZWN0aXZlKHtcbiAgICAgICAgc2VsZWN0b3I6IGRpcmVjdGl2ZS5zZWxlY3RvcixcbiAgICAgICAgaW5wdXRzOiBtZXJnZWRJbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IG1lcmdlZE91dHB1dHMsXG4gICAgICAgIGhvc3Q6IG1lcmdlZEhvc3QsXG4gICAgICAgIGV4cG9ydEFzOiBkaXJlY3RpdmUuZXhwb3J0QXMsXG4gICAgICAgIHF1ZXJpZXM6IG1lcmdlZFF1ZXJpZXMsXG4gICAgICAgIHByb3ZpZGVyczogZGlyZWN0aXZlLnByb3ZpZGVycywgZ3VhcmRzXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNEaXJlY3RpdmVNZXRhZGF0YSh0eXBlOiBhbnkpOiB0eXBlIGlzIERpcmVjdGl2ZSB7XG4gIHJldHVybiBjcmVhdGVEaXJlY3RpdmUuaXNUeXBlT2YodHlwZSkgfHwgY3JlYXRlQ29tcG9uZW50LmlzVHlwZU9mKHR5cGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZExhc3Q8VD4oYXJyOiBUW10sIGNvbmRpdGlvbjogKHZhbHVlOiBUKSA9PiBib29sZWFuKTogVHxudWxsIHtcbiAgZm9yIChsZXQgaSA9IGFyci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChjb25kaXRpb24oYXJyW2ldKSkge1xuICAgICAgcmV0dXJuIGFycltpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=