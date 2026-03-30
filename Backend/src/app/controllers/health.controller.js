export class HealthController {
  check = (_, res) => {
    res.json({ ok: true });
  };
}
