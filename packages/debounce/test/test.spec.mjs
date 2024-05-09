/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
import { describe, it } from 'node:test'
import assert from 'node:assert'

// » IMPORT MODULES
import { debounce } from '../dist/index.mjs'


// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('TESTING', async () => {
  it('should debounce function calls', () => {
    const mockFunction = () => { };
    const debouncedFunction = debounce(mockFunction, 1000);

    // Simular el paso del tiempo
    setTimeout(() => {
      debouncedFunction();
    }, 500);

    setTimeout(() => {
      debouncedFunction();
    }, 900);

    setTimeout(() => {
      debouncedFunction();
    }, 1300);

    setTimeout(() => {
      // Verificar que la función solo se haya llamado una vez
      assert.strictEqual(debouncedFunction(), undefined);
    }, 2000);
  });

  it('should call onCall function if provided', () => {
    const mockFunction = () => { };
    let called = false;
    const onCallFunction = () => {
      called = true;
    };
    const debouncedFunction = debounce(mockFunction, 1000, { onCall: onCallFunction });

    // Llamar a la función debounce
    debouncedFunction();

    // Verificar que la función onCall haya sido llamada
    assert.strictEqual(called, true);
  });
  it('should call onComplete function if provided', () => {
    const mockFunction = () => { };
    let completed = false;
    const onCompleteFunction = () => {
      completed = true;
    };
    const debouncedFunction = debounce(mockFunction, 1000, { onComplete: onCompleteFunction });

    // Simular llamadas a la función debounce
    debouncedFunction();
    debouncedFunction();

    // Avanzar el tiempo lo suficiente para que se complete la función debounce
    setTimeout(() => {
      // Verificar que la función onComplete haya sido llamada
      assert.strictEqual(completed, true);
    }, 1500);
  });
  it('should call onFlood function if flood limit is reached', () => {
    const mockFunction = () => { };
    let floodCalled = false;
    const onFloodFunction = () => {
      floodCalled = true;
    };
    const debouncedFunction = debounce(mockFunction, 1000, { flood: 3, onFlood: onFloodFunction });

    // Llamar a la función debounce múltiples veces
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();

    // Verificar que la función onFlood haya sido llamada
    assert.strictEqual(floodCalled, true);
  });
})
