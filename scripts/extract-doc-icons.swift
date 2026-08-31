import AppKit
import Foundation

let args = CommandLine.arguments
guard args.count >= 3 else { exit(1) }
let outDir = args[1]
let ws = NSWorkspace.shared

for spec in args.dropFirst(2) {
    let parts = spec.split(separator: ":", maxSplits: 1).map(String.init)
    guard parts.count == 2 else { continue }
    let ext = parts[0], name = parts[1]
    // make a temp file with that extension so the OS resolves the real doc icon
    let tmp = NSTemporaryDirectory() + "iconprobe." + ext
    FileManager.default.createFile(atPath: tmp, contents: Data())
    let icon = ws.icon(forFile: tmp)
    icon.size = NSSize(width: 256, height: 256)
    guard let tiff = icon.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { continue }
    try? png.write(to: URL(fileURLWithPath: "\(outDir)/\(name).png"))
    print("ok \(name)")
    try? FileManager.default.removeItem(atPath: tmp)
}
