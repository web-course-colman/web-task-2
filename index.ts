// guy-yablonka-212173884-ethan-larrar-341073781
import { createApp } from "./src/app";

const app = createApp();

const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
