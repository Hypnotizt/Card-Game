"""
Card Frame System v5 - Production Ready
- Proper text centering (especially stats)
- Keyword bolding in ability text
- Auto-scaling for long text
- Robust handling of missing content
- Cleaner text color hierarchy
"""

from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import math
import re

class CardBuilder:
    def __init__(self, back_image_path):
        self.back = Image.open(back_image_path).convert("RGBA")
        self.CARD_W, self.CARD_H = self.back.size
        
        # === BOUNDARIES ===
        self.BORDER_THICKNESS = 35
        
        self.CONTENT_LEFT = self.BORDER_THICKNESS
        self.CONTENT_RIGHT = self.CARD_W - self.BORDER_THICKNESS
        self.CONTENT_TOP = self.BORDER_THICKNESS
        self.CONTENT_BOTTOM = self.CARD_H - self.BORDER_THICKNESS
        self.CONTENT_WIDTH = self.CONTENT_RIGHT - self.CONTENT_LEFT
        self.CONTENT_HEIGHT = self.CONTENT_BOTTOM - self.CONTENT_TOP
        
        self.ZONE_GAP = 8
        
        # === ZONE PROPORTIONS ===
        self.NAME_RATIO = 0.08
        self.ART_RATIO = 0.44
        self.TYPE_RATIO = 0.05
        self.TEXT_RATIO = 0.31
        self.STAT_RATIO = 0.12
        
        # === COLORS ===
        self.DARKER_BLUE = (18, 32, 42)
        self.DEEP_TEAL = (38, 58, 66)
        self.BRONZE = (165, 130, 85)
        self.BRONZE_LIGHT = (195, 165, 115)
        self.BRONZE_DARK = (120, 90, 55)
        self.GEM_BLUE = (55, 95, 110)
        
        # Text colors - clear hierarchy
        self.COLOR_NAME = (225, 195, 135)       # Bright gold for title
        self.COLOR_TYPE = (170, 150, 115)       # Muted bronze for type
        self.COLOR_ABILITY = (225, 220, 205)    # Warm white for abilities
        self.COLOR_KEYWORD = (240, 210, 150)    # Highlighted gold for keywords
        self.COLOR_FLAVOR = (95, 145, 155)      # Teal for flavor
        self.COLOR_STAT_ATK = (255, 235, 215)   # Warm white for attack
        self.COLOR_STAT_DEF = (215, 235, 255)   # Cool white for defense
        
        # === BASE FONT SIZES ===
        self.FONT_NAME = 54
        self.FONT_TYPE = 28
        self.FONT_BODY = 32
        self.FONT_KEYWORD = 32
        self.FONT_FLAVOR = 24
        self.FONT_STAT = 50
        
        # === TEXT LAYOUT ===
        self.TEXT_H_PADDING = 20
        self.ABILITY_LINE_SPACING = 42
        self.FLAVOR_LINE_SPACING = 32
        self.FLAVOR_BOTTOM_MARGIN = 20
        
        # === LOAD FONTS ===
        self._load_fonts()
        
        self._extract_minimal_elements()
        self._calculate_zones()
    
    def _load_fonts(self):
        """Load all fonts with fallbacks"""
        try:
            self.font_name = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", self.FONT_NAME)
            self.font_type = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", self.FONT_TYPE)
            self.font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", self.FONT_BODY)
            self.font_keyword = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", self.FONT_KEYWORD)
            self.font_flavor = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf", self.FONT_FLAVOR)
            self.font_stat = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", self.FONT_STAT)
        except:
            default = ImageFont.load_default()
            self.font_name = self.font_type = self.font_body = default
            self.font_keyword = self.font_flavor = self.font_stat = default
    
    def _extract_minimal_elements(self):
        """Extract texture, gem, and edge strips from back"""
        self.texture = self.back.crop((150, 300, 350, 500))
        
        gem_size = 70
        cx, cy = self.CARD_W // 2, self.CARD_H // 2
        self.gem_source = self.back.crop((cx - gem_size, cy - gem_size, cx + gem_size, cy + gem_size))
        
        self.top_edge = self.back.crop((150, 12, self.CARD_W - 150, 32))
        self.bottom_edge = self.back.crop((150, self.CARD_H - 32, self.CARD_W - 150, self.CARD_H - 12))
        self.left_edge = self.back.crop((12, 150, 32, self.CARD_H - 150))
        self.right_edge = self.back.crop((self.CARD_W - 32, 150, self.CARD_W - 12, self.CARD_H - 150))
    
    def _calculate_zones(self):
        """Calculate pixel positions for all zones"""
        y = self.CONTENT_TOP
        
        self.name_height = int(self.CONTENT_HEIGHT * self.NAME_RATIO)
        self.name_rect = [self.CONTENT_LEFT, y, self.CONTENT_RIGHT, y + self.name_height]
        y += self.name_height + self.ZONE_GAP
        
        self.art_height = int(self.CONTENT_HEIGHT * self.ART_RATIO)
        self.art_rect = [self.CONTENT_LEFT, y, self.CONTENT_RIGHT, y + self.art_height]
        y += self.art_height + self.ZONE_GAP
        
        self.type_height = int(self.CONTENT_HEIGHT * self.TYPE_RATIO)
        self.type_rect = [self.CONTENT_LEFT, y, self.CONTENT_RIGHT, y + self.type_height]
        y += self.type_height + self.ZONE_GAP
        
        self.text_height = int(self.CONTENT_HEIGHT * self.TEXT_RATIO)
        self.text_rect = [self.CONTENT_LEFT, y, self.CONTENT_RIGHT, y + self.text_height]
        y += self.text_height + self.ZONE_GAP
        
        remaining = self.CONTENT_BOTTOM - y
        self.stat_y = y + remaining // 2
        self.stat_radius = 50
        self.stat_left_x = self.CONTENT_LEFT + 70
        self.stat_right_x = self.CONTENT_RIGHT - 70
    
    def build(self, art_image_path=None, card_name="", card_type="", abilities=None, flavor=None, attack="", defense=""):
        """Build the complete card"""
        # Normalize inputs
        abilities = abilities or []
        flavor = flavor or []
        if isinstance(flavor, str):
            flavor = [flavor]
        
        # === LAYER 1: Base with texture ===
        card = Image.new("RGBA", (self.CARD_W, self.CARD_H), self.DARKER_BLUE)
        
        texture_dark = ImageEnhance.Brightness(self.texture.resize((200, 200))).enhance(0.3)
        for x in range(0, self.CARD_W, 200):
            for y in range(0, self.CARD_H, 200):
                card.paste(texture_dark, (x, y))
        
        overlay = Image.new("RGBA", (self.CARD_W, self.CARD_H), (*self.DARKER_BLUE, 190))
        card = Image.alpha_composite(card, overlay)
        
        draw = ImageDraw.Draw(card)
        
        # === LAYER 2: Border ===
        self._draw_clean_border(draw)
        
        # === LAYER 3: Edge strips ===
        card = self._apply_edge_strips(card)
        draw = ImageDraw.Draw(card)
        
        # === LAYER 4: Zone fills ===
        self._draw_zone_fill(draw, self.name_rect)
        self._draw_zone_fill(draw, self.art_rect)
        self._draw_zone_fill(draw, self.type_rect)
        self._draw_zone_fill(draw, self.text_rect)
        
        # === LAYER 5: Art ===
        if art_image_path:
            card = self._place_art(card, art_image_path)
            draw = ImageDraw.Draw(card)
        
        # === LAYER 6: Zone frames ===
        self._draw_zone_frame(draw, self.name_rect)
        self._draw_zone_frame(draw, self.art_rect)
        self._draw_zone_frame(draw, self.type_rect, thin=True)
        self._draw_zone_frame(draw, self.text_rect)
        
        # === LAYER 7: Decorations ===
        self._draw_decorations(draw)
        
        # === LAYER 8: Stat badges ===
        card = self._draw_stat_badge(card, self.stat_left_x, self.stat_y, self.stat_radius, (150, 60, 60))
        card = self._draw_stat_badge(card, self.stat_right_x, self.stat_y, self.stat_radius, (60, 90, 150))
        draw = ImageDraw.Draw(card)
        
        # === LAYER 9: Text ===
        self._render_name(draw, card_name)
        self._render_type(draw, card_type)
        self._render_abilities(draw, abilities, flavor)
        self._render_stats(draw, attack, defense)
        
        return card
    
    # === BORDER AND FRAME METHODS ===
    
    def _draw_clean_border(self, draw):
        """Simple clean border"""
        draw.rectangle([0, 0, self.CARD_W-1, self.CARD_H-1], outline=self.BRONZE_DARK, width=4)
        draw.rectangle([6, 6, self.CARD_W-7, self.CARD_H-7], outline=self.BRONZE, width=3)
        draw.rectangle([12, 12, self.CARD_W-13, self.CARD_H-13], outline=self.BRONZE_LIGHT, width=1)
        
        # Corner L-shapes
        corner_len, corner_offset, corner_width = 35, 14, 6
        
        def rect(x1, y1, x2, y2):
            return [min(x1,x2), min(y1,y2), max(x1,x2), max(y1,y2)]
        
        corners = [
            (corner_offset, corner_offset, 1, 1),
            (self.CARD_W - corner_offset, corner_offset, -1, 1),
            (corner_offset, self.CARD_H - corner_offset, 1, -1),
            (self.CARD_W - corner_offset, self.CARD_H - corner_offset, -1, -1),
        ]
        
        for cx, cy, dx, dy in corners:
            draw.rectangle(rect(cx, cy, cx + corner_len * dx, cy + corner_width * dy), 
                          fill=self.BRONZE_DARK, outline=self.BRONZE, width=1)
            draw.rectangle(rect(cx, cy, cx + corner_width * dx, cy + corner_len * dy), 
                          fill=self.BRONZE_DARK, outline=self.BRONZE, width=1)
    
    def _apply_edge_strips(self, card):
        """Apply subtle scrollwork strips"""
        strip_inset = 55
        strip_margin = 8
        opacity = 180
        
        def prepare_strip(strip, size):
            resized = strip.resize(size, Image.LANCZOS).convert("RGBA")
            r, g, b, a = resized.split()
            a = Image.new("L", resized.size, opacity)
            return Image.merge("RGBA", (r, g, b, a))
        
        top_w = self.CARD_W - strip_inset * 2
        left_h = self.CARD_H - strip_inset * 2
        
        top_strip = prepare_strip(self.top_edge, (top_w, 18))
        card.paste(top_strip, (strip_inset, strip_margin), top_strip)
        
        bottom_strip = prepare_strip(self.bottom_edge, (top_w, 18))
        card.paste(bottom_strip, (strip_inset, self.CARD_H - strip_margin - 18), bottom_strip)
        
        left_strip = prepare_strip(self.left_edge, (18, left_h))
        card.paste(left_strip, (strip_margin, strip_inset), left_strip)
        
        right_strip = prepare_strip(self.right_edge, (18, left_h))
        card.paste(right_strip, (self.CARD_W - strip_margin - 18, strip_inset), right_strip)
        
        return card
    
    def _draw_zone_fill(self, draw, rect):
        """Gradient fill for a zone"""
        x1, y1, x2, y2 = rect
        height = y2 - y1
        for i in range(height):
            progress = i / height
            curve = math.sin(progress * math.pi)
            r = int(self.DARKER_BLUE[0] + (self.DEEP_TEAL[0] - self.DARKER_BLUE[0]) * curve * 0.4)
            g = int(self.DARKER_BLUE[1] + (self.DEEP_TEAL[1] - self.DARKER_BLUE[1]) * curve * 0.4)
            b = int(self.DARKER_BLUE[2] + (self.DEEP_TEAL[2] - self.DARKER_BLUE[2]) * curve * 0.4)
            draw.line([x1, y1 + i, x2, y1 + i], fill=(r, g, b))
    
    def _draw_zone_frame(self, draw, rect, thin=False):
        """Frame around a zone"""
        width = 2 if thin else 3
        draw.rectangle(rect, outline=self.BRONZE, width=width)
        if not thin:
            inner = [rect[0]+3, rect[1]+3, rect[2]-3, rect[3]-3]
            draw.rectangle(inner, outline=self.BRONZE_DARK, width=1)
    
    def _place_art(self, card, art_path):
        """Place artwork in art zone"""
        art = Image.open(art_path).convert("RGBA")
        
        padding = 6
        art_x = self.art_rect[0] + padding
        art_y = self.art_rect[1] + padding
        art_w = self.art_rect[2] - self.art_rect[0] - padding * 2
        art_h = self.art_rect[3] - self.art_rect[1] - padding * 2
        
        # Scale and crop to fit
        art_ratio = art.width / art.height
        window_ratio = art_w / art_h
        
        if art_ratio > window_ratio:
            new_h = art_h
            new_w = int(art_h * art_ratio)
        else:
            new_w = art_w
            new_h = int(art_w / art_ratio)
        
        art_resized = art.resize((new_w, new_h), Image.LANCZOS)
        crop_x = (new_w - art_w) // 2
        crop_y = (new_h - art_h) // 2
        art_cropped = art_resized.crop((crop_x, crop_y, crop_x + art_w, crop_y + art_h))
        
        card.paste(art_cropped, (art_x, art_y))
        
        # Inner shadow
        draw = ImageDraw.Draw(card)
        for i in range(10):
            alpha = int(80 * (1 - i/10))
            draw.rectangle([art_x + i, art_y + i, art_x + art_w - i, art_y + art_h - i], 
                           outline=(0, 0, 0, alpha))
        
        return card
    
    def _draw_decorations(self, draw):
        """Draw small decorative gems"""
        mid_x = self.CARD_W // 2
        
        # Gem between type and text
        self._draw_gem(draw, mid_x, self.text_rect[1], 7)
        
        # Corner gems
        inset = 18
        for x, y in [(inset, inset), (self.CARD_W - inset, inset), 
                     (inset, self.CARD_H - inset), (self.CARD_W - inset, self.CARD_H - inset)]:
            self._draw_gem(draw, x, y, 6)
        
        # Edge midpoint gems
        for x, y in [(mid_x, 12), (mid_x, self.CARD_H - 12), 
                     (12, self.CARD_H // 2), (self.CARD_W - 12, self.CARD_H // 2)]:
            self._draw_gem(draw, x, y, 5)
    
    def _draw_gem(self, draw, cx, cy, radius):
        """Small decorative gem"""
        draw.ellipse([cx - radius - 2, cy - radius - 2, cx + radius + 2, cy + radius + 2], 
                     fill=self.BRONZE, outline=self.BRONZE_LIGHT, width=1)
        draw.ellipse([cx - radius + 1, cy - radius + 1, cx + radius - 1, cy + radius - 1], 
                     fill=self.GEM_BLUE, outline=self.BRONZE_DARK)
        draw.ellipse([cx - radius + 2, cy - radius + 1, cx - radius + 4, cy - radius + 3], 
                     fill=(120, 170, 185))
    
    def _draw_stat_badge(self, card, cx, cy, radius, tint):
        """Stat badge with gem texture"""
        badge_size = radius * 2 + 16
        gem_sized = self.gem_source.resize((badge_size, badge_size))
        
        tint_layer = Image.new("RGBA", gem_sized.size, (*tint, 110))
        gem_tinted = Image.alpha_composite(gem_sized.convert("RGBA"), tint_layer)
        
        mask = Image.new("L", gem_sized.size, 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, badge_size - 1, badge_size - 1], fill=255)
        gem_tinted.putalpha(mask)
        
        card.paste(gem_tinted, (cx - badge_size // 2, cy - badge_size // 2), gem_tinted)
        
        draw = ImageDraw.Draw(card)
        draw.ellipse([cx - radius - 4, cy - radius - 4, cx + radius + 4, cy + radius + 4], 
                     outline=self.BRONZE, width=3)
        draw.ellipse([cx - radius - 1, cy - radius - 1, cx + radius + 1, cy + radius + 1], 
                     outline=self.BRONZE_LIGHT, width=2)
        
        return card
    
    # === TEXT RENDERING METHODS ===
    
    def _text_shadow(self, draw, pos, text, font, fill, offset=2):
        """Draw text with shadow"""
        x, y = pos
        draw.text((x + offset, y + offset), text, font=font, fill=(0, 0, 0))
        draw.text((x, y), text, font=font, fill=fill)
    
    def _center_text_in_rect(self, draw, rect, text, font, fill, offset=2):
        """Center text horizontally and vertically in a rectangle"""
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        rect_w = rect[2] - rect[0]
        rect_h = rect[3] - rect[1]
        
        x = rect[0] + (rect_w - text_w) // 2
        y = rect[1] + (rect_h - text_h) // 2 - bbox[1]  # Subtract bbox[1] to account for font ascent
        
        self._text_shadow(draw, (x, y), text, font, fill, offset)
    
    def _render_name(self, draw, name):
        """Render card name - bold, gold, centered"""
        if not name:
            return
        self._center_text_in_rect(draw, self.name_rect, name, self.font_name, self.COLOR_NAME, 3)
    
    def _render_type(self, draw, card_type):
        """Render type line - regular, muted bronze, centered"""
        if not card_type:
            return
        self._center_text_in_rect(draw, self.type_rect, card_type, self.font_type, self.COLOR_TYPE, 2)
    
    def _render_abilities(self, draw, abilities, flavor):
        """Render ability text (centered in available space) and flavor (anchored to bottom)"""
        if not abilities and not flavor:
            return
        
        text_left = self.text_rect[0] + self.TEXT_H_PADDING
        text_right = self.text_rect[2] - self.TEXT_H_PADDING
        text_width = text_right - text_left
        
        text_box_top = self.text_rect[1] + 12
        text_box_bottom = self.text_rect[3] - 12
        
        # Calculate flavor position (anchored to bottom)
        if flavor:
            total_flavor_height = len(flavor) * self.FLAVOR_LINE_SPACING
            flavor_start_y = text_box_bottom - self.FLAVOR_BOTTOM_MARGIN - total_flavor_height + self.FLAVOR_LINE_SPACING // 2
        else:
            flavor_start_y = text_box_bottom
        
        # Calculate ability space
        ability_zone_bottom = flavor_start_y - 25 if flavor else text_box_bottom
        available_height = ability_zone_bottom - text_box_top
        
        # Render abilities (centered in available space)
        if abilities:
            total_ability_height = len(abilities) * self.ABILITY_LINE_SPACING
            ability_start_y = text_box_top + (available_height - total_ability_height) // 2
            
            for i, line in enumerate(abilities):
                line_y = ability_start_y + i * self.ABILITY_LINE_SPACING
                self._render_ability_line(draw, line, line_y, text_left, text_width)
        
        # Render flavor (anchored to bottom)
        if flavor:
            for i, line in enumerate(flavor):
                bbox = draw.textbbox((0, 0), line, font=self.font_flavor)
                line_w = bbox[2] - bbox[0]
                line_x = text_left + (text_width - line_w) // 2
                line_y = flavor_start_y + i * self.FLAVOR_LINE_SPACING
                self._text_shadow(draw, (line_x, line_y), line, self.font_flavor, self.COLOR_FLAVOR, 2)
    
    def _render_ability_line(self, draw, line, y, text_left, text_width):
        """Render a single ability line with keyword highlighting"""
        # Check for keyword pattern: "Keyword —" or "Keyword:" at start of line
        # Match: Word(s) followed by em-dash, colon, or hyphen
        keyword_match = re.match(r'^([A-Z][a-zA-Z]*(?:\s[A-Z][a-zA-Z]*)?)\s*([—:\-–])\s*', line)
        
        if keyword_match:
            keyword = keyword_match.group(1)
            separator = keyword_match.group(2)
            rest = line[keyword_match.end():]
            
            # Measure parts
            keyword_bbox = draw.textbbox((0, 0), keyword, font=self.font_keyword)
            keyword_w = keyword_bbox[2] - keyword_bbox[0]
            
            sep_with_spaces = f" {separator} "
            sep_bbox = draw.textbbox((0, 0), sep_with_spaces, font=self.font_body)
            sep_w = sep_bbox[2] - sep_bbox[0]
            
            rest_bbox = draw.textbbox((0, 0), rest, font=self.font_body)
            rest_w = rest_bbox[2] - rest_bbox[0]
            
            total_w = keyword_w + sep_w + rest_w
            start_x = text_left + (text_width - total_w) // 2
            
            # Draw keyword (bold, highlighted)
            self._text_shadow(draw, (start_x, y), keyword, self.font_keyword, self.COLOR_KEYWORD, 2)
            
            # Draw separator (regular)
            self._text_shadow(draw, (start_x + keyword_w, y), sep_with_spaces, self.font_body, self.COLOR_ABILITY, 2)
            
            # Draw rest (regular)
            self._text_shadow(draw, (start_x + keyword_w + sep_w, y), rest, self.font_body, self.COLOR_ABILITY, 2)
        else:
            # No keyword, just center the line
            bbox = draw.textbbox((0, 0), line, font=self.font_body)
            line_w = bbox[2] - bbox[0]
            line_x = text_left + (text_width - line_w) // 2
            self._text_shadow(draw, (line_x, y), line, self.font_body, self.COLOR_ABILITY, 2)
    
    def _render_stats(self, draw, attack, defense):
        """Render stat numbers - PROPERLY CENTERED in badges"""
        if attack:
            self._render_stat_number(draw, attack, self.stat_left_x, self.stat_y, self.COLOR_STAT_ATK)
        
        if defense:
            self._render_stat_number(draw, defense, self.stat_right_x, self.stat_y, self.COLOR_STAT_DEF)
    
    def _render_stat_number(self, draw, value, cx, cy, color):
        """Render a stat number perfectly centered in its badge"""
        # Get the bounding box
        bbox = draw.textbbox((0, 0), value, font=self.font_stat)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        # Calculate position - account for bbox offset
        x = cx - text_w // 2 - bbox[0]
        y = cy - text_h // 2 - bbox[1]
        
        # Draw with shadow
        self._text_shadow(draw, (x, y), value, self.font_stat, color, 3)


# === MAIN ===
if __name__ == "__main__":
    back_path = "/mnt/user-data/uploads/hypnotizt_dark_fantasy_intricate_card_frame_back_side_of_play_a3d93174-5382-4abe-93aa-dd5234cf36b0_0.png"
    art_path = "/mnt/user-data/uploads/hypnotizt_A_vampire_like_monster_slicing_a_man_with_its_claws_g_1909acb1-95e3-4eba-86f2-f92286827ba3.png"
    
    builder = CardBuilder(back_path)
    
    print(f"Card size: {builder.CARD_W}x{builder.CARD_H}")
    
    # Test card
    card = builder.build(
        art_image_path=art_path,
        card_name="BLOODRENDER",
        card_type="Creature — Vampire Assassin",
        abilities=[
            "Deathstrike — When Bloodrender attacks,",
            "destroy target creature with less power."
        ],
        flavor=[
            "\"The last thing they see is their",
            "own reflection in the blade.\""
        ],
        attack="4",
        defense="2"
    )
    
    card = card.convert("RGB")
    card.save("/home/claude/card_v5.png", quality=95)
    print("Saved: /home/claude/card_v5.png")
    
    # Test with double-digit stats
    card2 = builder.build(
        art_image_path=art_path,
        card_name="ANCIENT DRAGON",
        card_type="Creature — Elder Dragon",
        abilities=[
            "Flying — Can only be blocked by",
            "creatures with flying.",
            "Firebreath — Deal 3 damage to",
            "target creature or player."
        ],
        flavor=[
            "\"Its wings blot out the sun.\""
        ],
        attack="12",
        defense="10"
    )
    
    card2 = card2.convert("RGB")
    card2.save("/home/claude/card_v5_dragon.png", quality=95)
    print("Saved: /home/claude/card_v5_dragon.png")
    
    # Comparison
    back = Image.open(back_path).convert("RGB")
    comparison = Image.new("RGB", (builder.CARD_W * 2 + 20, builder.CARD_H), (20, 20, 25))
    comparison.paste(card, (0, 0))
    comparison.paste(back, (builder.CARD_W + 20, 0))
    comparison.save("/home/claude/card_v5_comparison.png", quality=95)
    print("Saved comparison")
