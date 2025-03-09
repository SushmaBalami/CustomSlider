import CustomSlider from "./component/customslider";

export default function SliderExample() {
  const items = Array.from({ length: 12 }, (_, i) => (
    <div key={i} className="w-full h-full flex items-center justify-center">
      <span className="text-xl font-bold">Item {i + 1}</span>
    </div>
  ));

  return (
    <div className="container mx-auto p-4 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Horizontal Slider (4 items per slide, starting at center)
        </h2>
        <CustomSlider
          items={items}
          itemsPerSlide={4}
          autoplay={true}
          autoplaySpeed={5000}
          navType="both"
          startPosition="center"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Vertical Slider (3 items per slide)
        </h2>
        <CustomSlider
          items={items}
          itemsPerSlide={3}
          vertical={true}
          navType="none"
          startPosition="start"
          className="h-[400px]"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Dots-only Navigation (2 items per slide)
        </h2>
        <CustomSlider
          items={items}
          itemsPerSlide={2}
          navType="dots"
          startPosition="end"
          gap={16}
        />
      </div>
    </div>
  );
}
