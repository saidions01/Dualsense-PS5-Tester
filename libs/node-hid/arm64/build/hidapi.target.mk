# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := hidapi
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=hidapi' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_GLIBCXX_USE_CXX11_ABI=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DDEBUG' \
	'-D_DEBUG' \
	'-DV8_ENABLE_CHECKS'

# Flags passed to all source files.
CFLAGS_Debug := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-g \
	-g \
	-O0

# Flags passed to only C files.
CFLAGS_C_Debug :=

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++17

INCS_Debug := \
	-I/home/pi/.cache/node-gyp/18.20.4/include/node \
	-I/home/pi/.cache/node-gyp/18.20.4/src \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/openssl/config \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/openssl/openssl/include \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/uv/include \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/zlib \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/v8/include \
	-I$(srcdir)/hidapi/hidapi \
	-I/usr/include/libusb-1.0

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=hidapi' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_GLIBCXX_USE_CXX11_ABI=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS'

# Flags passed to all source files.
CFLAGS_Release := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-g \
	-O3 \
	-fno-omit-frame-pointer

# Flags passed to only C files.
CFLAGS_C_Release :=

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++17

INCS_Release := \
	-I/home/pi/.cache/node-gyp/18.20.4/include/node \
	-I/home/pi/.cache/node-gyp/18.20.4/src \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/openssl/config \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/openssl/openssl/include \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/uv/include \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/zlib \
	-I/home/pi/.cache/node-gyp/18.20.4/deps/v8/include \
	-I$(srcdir)/hidapi/hidapi \
	-I/usr/include/libusb-1.0

OBJS := \
	$(obj).target/$(TARGET)/hidapi/libusb/hid.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.c FORCE_DO_CMD
	@$(call do_cmd,cc,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.c FORCE_DO_CMD
	@$(call do_cmd,cc,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.c FORCE_DO_CMD
	@$(call do_cmd,cc,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-pthread \
	-rdynamic

LDFLAGS_Release := \
	-pthread \
	-rdynamic

LIBS :=

$(obj).target/hidapi.a: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/hidapi.a: LIBS := $(LIBS)
$(obj).target/hidapi.a: TOOLSET := $(TOOLSET)
$(obj).target/hidapi.a: $(OBJS)
	$(call create_archive,$@,$^)

# Add target alias
.PHONY: hidapi
hidapi: $(obj).target/hidapi.a

# Add target alias to "all" target.
.PHONY: all
all: hidapi

# Add target alias
.PHONY: hidapi
hidapi: $(builddir)/hidapi.a

# Copy this to the static library output path.
$(builddir)/hidapi.a: TOOLSET := $(TOOLSET)
$(builddir)/hidapi.a: $(obj).target/hidapi.a FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/hidapi.a
# Short alias for building this static library.
.PHONY: hidapi.a
hidapi.a: $(obj).target/hidapi.a $(builddir)/hidapi.a

# Add static library to "all" target.
.PHONY: all
all: $(builddir)/hidapi.a

