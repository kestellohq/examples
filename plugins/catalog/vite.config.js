// Optional: without this file the build uses Kestello's preset as it is. Keep one to change
// the Vite settings; build with `sh tools/build.sh plugins/catalog` (the compiled assets/build/
// ships with the plugin). See kestello/core/build/preset.mjs.
import { kestello } from '../../kestello/core/build/preset.mjs';

export default kestello({ root: import.meta.dirname });
