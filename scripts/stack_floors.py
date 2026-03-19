import xml.etree.ElementTree as ET

def create_stacked_svg():
    # The list of your files, from bottom floor to top floor
    floor_files = ['Floor 1.svg', 'Floor 2.svg', 'Floor 3.svg', 'Floor 4.svg']

    # We register the SVG namespace so it doesn't prepend "ns0:" to every tag
    ET.register_namespace('', "http://www.w3.org/2000/svg")

    # Create the root for the new SVG with a large canvas to fit everything
    root = ET.Element("{http://www.w3.org/2000/svg}svg",
                      width="2000", height="2000",
                      viewBox="-800 -1650 3000 3000")

    # How far apart the floors should be stacked vertically
    y_offset_step = 700

    print("Starting the stacking process...")

    for i, file in enumerate(floor_files):
        try:
            # Parse the original SVG file
            tree = ET.parse(file)
            svg_root = tree.getroot()

            # Create a group <g> tag for this specific floor
            group = ET.SubElement(root, "g")

            # Apply an isometric transformation:
            # 1. Translate it vertically based on its floor number
            # 2. Scale the Y-axis to squash it flat
            # 3. Rotate it 45 degrees
            y_pos = - (i * y_offset_step)
            transform_str = f"translate(0, {y_pos}) scale(1, 0.6) rotate(30)"
            group.set("transform", transform_str)

            # Copy all the paths and shapes from the original floor into our new group
            for child in svg_root:
                group.append(child)

            print(f"Successfully processed {file}")

        except FileNotFoundError:
            print(f"Error: Could not find '{file}'. Please ensure it is in the same folder as this script.")
            return

    # Save the brand new stacked SVG
    output_filename = "Stacked_Isometric_Floors.svg"
    tree = ET.ElementTree(root)
    tree.write(output_filename, encoding="utf-8", xml_declaration=True)
    print(f"\nDone! Your stacked floorplan has been saved as: {output_filename}")

if __name__ == "__main__":
    create_stacked_svg()