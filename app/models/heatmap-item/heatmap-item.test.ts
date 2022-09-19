import { HeatmapItemModel } from "./heatmap-item"

test("can be created", () => {
  const instance = HeatmapItemModel.create({})

  expect(instance).toBeTruthy()
})
